import catchAsync from "@/handlers/async.handler";
import { Request, Response } from "express";
import { User } from "generated/prisma/client";
import { db } from "@/config/database";
import { APIError } from "@/utils/APIerror";
import { ImageService } from "@/services/image.service";

const checkEligibility = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const pendingRequestsCount = await db.propertyRequests.count({
		where: {
			userId: user.id,
			status: "PENDING",
		},
	});
	if (pendingRequestsCount >= 3) {
		res.status(200).json({ eligible: false, message: "Maximum of 3 pending property requests reached" });
		return;
	}
	res.status(200).json({ eligible: true });
	return;
});

const requestedProperties = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const requests = await db.propertyRequests.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: "desc" },
	});
	res.status(200).json({ requests });
	return;
});

const requestProperty = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const { entity } = req.body;

	if (!entity) {
		throw new APIError(400, "Property entity is required");
	}

	// Check the number of pending property requests
	const pendingRequestsCount = await db.propertyRequests.count({
		where: {
			userId: user.id,
			status: "PENDING",
		},
	});

	if (pendingRequestsCount >= 3) {
		throw new APIError(429, "Maximum of 3 pending property requests allowed per user");
	}

	// Check if user already requested this property
	const existingRequest = await db.propertyRequests.findFirst({
		where: { userId: user.id, entity },
	});

	if (existingRequest) {
		throw new APIError(409, "Property already requested");
	}

	const playerId = (user.minecraftPlayerData as any)?.id || "";
	const request = await db.propertyRequests.create({
		data: {
			entity,
			userId: user.id,
			minecraftPlayerId: playerId,
		},
	});

	res.status(201).json({
		message: "Property request submitted successfully",
		request,
	});
	return;
});

const uploadRequestImage = catchAsync(async (req: Request, res: Response) => {
	const file = req.file;

	if (!file) {
		throw new APIError(400, "No image file provided");
	}

	const uploadResult = await ImageService.uploadImage(file, "property-requests");

	res.status(200).json({
		message: "Image uploaded successfully",
		image: {
			public_id: uploadResult.public_id,
			url: uploadResult.secure_url,
		},
	});
	return;
});

const deletePropertyRequest = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const { id } = req.params;

	if (!id) {
		throw new APIError(400, "Property request ID is required");
	}

	const request = await db.propertyRequests.findFirst({
		where: { id, userId: user.id },
	});

	if (!request) {
		throw new APIError(404, "Property request not found");
	}

	await db.propertyRequests.delete({
		where: { id },
	});

	res.status(200).json({
		message: "Property request deleted successfully",
	});
	return;
});

const getPropertyRequestsStatus = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;

	const requests = await db.propertyRequests.findMany({
		where: { userId: user.id },
		select: {
			id: true,
			entity: true,
			status: true,
			stage: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: { createdAt: "desc" },
	});

	const statusSummary = {
		total: requests.length,
		pending: requests.filter(r => r.status === "PENDING").length,
		approved: requests.filter(r => r.status === "APPROVED").length,
		rejected: requests.filter(r => r.status === "REJECTED").length,
	};

	res.status(200).json({
		statusSummary,
		requests,
	});
	return;
});

export default {
	requestProperty,
	checkEligibility,
	requestedProperties,
	uploadRequestImage,
	deletePropertyRequest,
	getPropertyRequestsStatus,
};
