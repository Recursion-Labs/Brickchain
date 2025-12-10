import catchAsync from "@/handlers/async.handler";
import { Request, Response } from "express";
import { User } from "generated/prisma/client";
import { ImageService } from "@/services/image.service";
import { db, db as prisma } from "@/config/database";
import { APIError } from "@/utils/APIerror";

const getUserByToken = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	res.status(200).json({ user });
	return;
});

const uploadProfilePicture = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const file = req.file;

	if (!file) {
		res.status(400).json({ error: "No image file provided" });
		return;
	}

	// Delete old profile picture if exists
	if (user.profilePicture) {
		try {
			const publicId = user.profilePicture.split("/").pop()?.split(".")[0];
			if (publicId) {
				await ImageService.deleteImage(`profile-pictures/${publicId}`);
			}
		} catch (error) {
			console.warn("Failed to delete old profile picture:", error);
		}
	}

	// Upload new image
	const uploadResult = await ImageService.uploadProfilePicture(file);

	// Update user in database
	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: { profilePicture: uploadResult.secure_url },
	});

	res.status(200).json({
		message: "Profile picture uploaded successfully",
		user: updatedUser,
		imageUrl: uploadResult.secure_url,
	});
});

const uploadBanner = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const file = req.file;

	if (!file) {
		res.status(400).json({ error: "No image file provided" });
		return;
	}

	// Delete old banner if exists
	if (user.banner) {
		try {
			// Extract public_id from the URL
			const publicId = user.banner.split("/").pop()?.split(".")[0];
			if (publicId) {
				await ImageService.deleteImage(`banners/${publicId}`);
			}
		} catch (error) {
			console.warn("Failed to delete old banner:", error);
		}
	}

	// Upload new image
	const uploadResult = await ImageService.uploadBanner(file);

	// Update user in database
	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: { banner: uploadResult.secure_url },
	});

	res.status(200).json({
		message: "Banner uploaded successfully",
		user: updatedUser,
		imageUrl: uploadResult.secure_url,
	});
	return;
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	const { name, bio } = req.body;
	try {
		await db.user.update({
			where: {
				id: user.id,
			},
			data: {
				name,
				bio,
			},
		});
		res.status(200).json({
			message: "Profile updated successfully",
		});
		return;
	} catch (error) {
		throw new APIError(500, "Failed to update profile");
	}
});

export default {
	getUserByToken,
	uploadProfilePicture,
	uploadBanner,
	updateProfile,
};
