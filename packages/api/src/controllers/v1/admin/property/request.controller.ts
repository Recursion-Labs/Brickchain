import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";
import { db } from "@/config/database";

const updateRequest = catchAsync(async (req: Request, res: Response) => {
	const id = req.query.id as string;
	if (!id) {
		throw new APIError(400, "Request ID is required");
	}

	const { status } = req.body;
	if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
		throw new APIError(400, "Valid status is required (PENDING, APPROVED, REJECTED)");
	}

	const updatedRequest = await db.propertyRequests.update({
		where: { id },
		data: { status },
	});

	// Notify Minecraft plugin if status is APPROVED or REJECTED
	if (status === "APPROVED" || status === "REJECTED") {
		try {
			const response = await fetch("http://localhost:8080/api/property/status", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					propertyId: updatedRequest.id, // Using request ID as propertyId, adjust if needed
					status: status === "APPROVED" ? "Approved" : "Rejected",
				}),
			});

			if (!response.ok) {
				console.error("Failed to notify Minecraft plugin:", response.statusText);
			}
		} catch (error) {
			console.error("Error notifying Minecraft plugin:", error);
		}
	}

	res.status(200).json({
		message: "Property request status updated successfully",
		request: updatedRequest,
	});
	return;
});

export default {
	updateRequest,
};
