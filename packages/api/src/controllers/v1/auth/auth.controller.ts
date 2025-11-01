import { RegisterInput, SendOtpInput, VerifyOtpInput } from "@/@types/interface";
import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";
import { sendOTP } from "@/services/resend.service";
import { generateCode } from "@/tools/codes";
import { db, redis } from "@/config/database";
import { logger } from "@/utils/logger";

const register = catchAsync(async (req: Request, res: Response) => {
	const { email } = req.body as RegisterInput;
	if (!email) {
		throw new APIError(400, "Email is required");
	}
	const check = await db.user.findFirst({ where: { email } });
	if (check) {
		throw new APIError(409, "User already exists");
	}
	await redis.setValue(`user:${email}:registered`, "true", 180);
	res.status(201).json({ message: "User registered successfully" });
	return;
});

const sendOtp = catchAsync(async (req: Request, res: Response) => {
	const { email } = req.body as SendOtpInput;
	if (!email) {
		throw new APIError(400, "Email is required");
	}
	const check_reg = await redis.getValue(`user:${email}:registered`);
	if (!check_reg) {
		throw new APIError(404, "User not registered");
	}
	try {
		const otp = await generateCode(5);
		await sendOTP(email, otp);
		res.status(200).json({ message: "OTP sent successfully" });
		return;
	} catch (error) {
		logger.error("[ OTP ] : failed to send OTP : ", error);
		res.status(500).json({ message: "Failed to send OTP" });
	}
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
	const { email, otp } = req.body as VerifyOtpInput;
	if (!email || !otp) {
		throw new APIError(400, "Email and OTP are required");
	}
	const storedOtp = await redis.getValue(`otp:${email}`);
	if (storedOtp !== otp) {
		throw new APIError(400, "Invalid OTP");
	}
	await db.user.create({
		data: {
			email: email,
		},
	});
	res.status(200).json({ message: "OTP verified successfully" });
	return;
});

export default {
	register,
	sendOtp,
	verifyOtp,
};
