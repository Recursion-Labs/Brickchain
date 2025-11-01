import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const sendOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});
export type SendOtpInput = z.infer<typeof sendOtpSchema>;