import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { logger } from "@/utils/logger";
import envVars from "@/config/envVars";
import { redis } from "@/config/database";

const resendClient = new Resend(envVars.RESEND_API_KEY);

export async function sendOTP(email: string, otp: string) {
	const templatePath = path.join(__dirname, "../templates/index.html");
	let html = "<p>Your OTP code is: <strong>" + otp + "</strong></p>";
	await redis.setValue(`otp:${email}`, otp, 300);
	try {
		const template = fs.readFileSync(templatePath, "utf8");
		html = template.replace("{{OTP}}", otp);
	} catch (err) {
		logger.warn("Failed to load template, falling back to simple OTP HTML:", err);
	}

	await resendClient.emails.send({
		from: "otps@techsolace.tech",
		to: email,
		subject: "Your OTP Code",
		html,
	});
}
