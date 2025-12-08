import catchAsync from "@/handlers/async.handler";
import { Request, Response } from "express";
import { User } from "generated/prisma/client";
import { db } from "@/config/database";
import { APIError } from "@/utils/APIerror";

const requestedProperties = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;

	const requests = await db.propertyRequests.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' }
	});

	res.status(200).json({ requests });
	return;
})

const requestProperty = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const { entity } = req.body;

	if (!entity) {
		throw new APIError(400, "Property entity is required");
	}

	// Check if user already requested this property
	const existingRequest = await db.propertyRequests.findFirst({
		where: { userId: user.id, entity }
	});

	if (existingRequest) {
		throw new APIError(409, "Property already requested");
	}

	const playerId = (user.minecraftPlayerData as any)?.id || "";
	const request = await db.propertyRequests.create({
		data: {
			entity,
			userId: user.id,
			minecraftPlayerId: playerId
		}
	});

	res.status(201).json({
		message: "Property request submitted successfully",
		request
	});
	return;
})

const uploadRequestImage = catchAsync(async (req: Request, res: Response) => {
	const file = req.file;

	if (!file) {
		res.status(400).json({ error: "No image file provided" });;
		return;
	}
	res.status(200).json({
		message: "Image uploaded successfully",
		file: {
			originalname: file.originalname,
			filename: file.filename
		}
	});
	return;
})

const deletePropertyRequest = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const { id } = req.params;

	if (!id) {
		throw new APIError(400, "Property request ID is required");
	}

	const request = await db.propertyRequests.findFirst({
		where: { id, userId: user.id }
	});

	if (!request) {
		throw new APIError(404, "Property request not found");
	}

	await db.propertyRequests.delete({
		where: { id }
	});

	res.status(200).json({
		message: "Property request deleted successfully"
	});
	return;
})

export default {
	requestProperty,
	requestedProperties,
	uploadRequestImage,
	deletePropertyRequest
}