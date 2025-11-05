import { z } from "zod";

// Extend Express Request interface for Passport
declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

export const registerSchema = z.object({
	email: z.string().email(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const sendOtpSchema = z.object({
	email: z.string().email(),
});
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
	email: z.string().email(),
	otp: z.string().length(6),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
