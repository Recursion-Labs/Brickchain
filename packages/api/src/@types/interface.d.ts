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
	name: z.string().min(1).max(100),
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

export const propertyDtoSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	type: z.enum(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "LAND", "MULTI_FAMILY", "OFFICE_BUILDING", "RETAIL", "MIXED_USE"]),
	Location: z.string(),
	Value: z.number(),
	Shares: z.number(),
	createdAt: z.date(),
	updatedAt: z.date(),
});
export type PropertyDTO = z.infer<typeof propertyDtoSchema>;
