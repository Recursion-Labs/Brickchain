import catchAsync from "@/handlers/async.handler";
import { Request, Response } from "express";
import { User } from "generated/prisma/client";

const getUserByToken = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as User;
	res.status(200).json({ user });
	return;
});

export default {
	getUserByToken,
};
