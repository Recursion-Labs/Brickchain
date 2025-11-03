import { RegisterInput, SendOtpInput, VerifyOtpInput } from "@/@types/interface";
import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";
import { sendOTP } from "@/services/resend.service";
import { generateCode } from "@/tools/codes";
import { db, redis } from "@/config/database";
import { logger } from "@/utils/logger";
import { User } from "generated/prisma/client";
import { generateTokens } from "@/services/jwt.service"
import { v4 as uuidv4 } from "uuid";

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

const login = catchAsync(async (req: Request, res: Response) => {
	const { email} = req.body as RegisterInput;
	if (!email) {
		throw new APIError(400, "Email is required");
	}
	const check = await db.user.findFirst({
		where: {
			email: email
		}
	})
	if (!check) {
		throw new APIError(404, "User not found, please register first");
	}
	res.status(200).json({ message: "Login Initiated" });
})


const sendOtp = catchAsync(async (req: Request, res: Response) => {
	const { email } = req.body as SendOtpInput;
	if (!email) {
		throw new APIError(400, "Email is required");
	}
	const check_reg = await redis.getValue(`user:${email}:registered`);
	const check = await db.user.findFirst({ where: { email } });
	if (!check_reg && !check) {
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
	let user: User | null
	user = await db.user.findFirst({ where: { email } });
	if (!user) {
		user = await db.user.create({
			data: {
				email: email,
			},
		});
	}
	const jti = uuidv4();
	const { refreshToken, accessToken } = await generateTokens(user, jti);
	res.status(200).json({
		message: "OTP verified successfully",
		tokens : {
			accessToken,
			refreshToken
		}
	});
	return;
});

export default {
	register,
	login,
	sendOtp,
	verifyOtp,
};
