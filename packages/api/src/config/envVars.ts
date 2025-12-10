import { logger } from "@/utils/logger";
import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const EnvConfigSchema = z.object({
	DATABASE_URL: z.string().min(1, { message: "DATABASE_URL is required" }),
	PORT: z.coerce
		.number({
			error: "PORT must be a valid number",
		})
		.int()
		.positive()
		.default(3000),

	NODE_ENV: z
		.enum(["development", "production", "test"] as const, {
			error: "NODE_ENV must be one of: development, production, test",
		})
		.default("development"),

	RESEND_API_KEY: z.string().min(1, { message: "RESEND_API_KEY is required" }),
	REDIS_HOST: z.string().min(1, { message: "REDIS_HOST is required" }),
	REDIS_PORT: z.coerce
		.number({
			error: "REDIS_PORT must be a valid number",
		})
		.int()
		.positive()
		.default(6379),
	REDIS_DB: z.coerce
		.number({
			error: "REDIS_DB must be a valid number",
		})
		.int()
		.nonnegative()
		.default(0),
	JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),
	GOOGLE_CLIENT_ID: z.string().min(1, { message: "GOOGLE_CLIENT_ID is required" }),
	GOOGLE_CLIENT_SECRET: z.string().min(1, { message: "GOOGLE_CLIENT_SECRET is required" }),
	GOOGLE_CALLBACK_URL: z.string().min(1, { message: "GOOGLE_CALLBACK_URL is required" }),
	FRONTEND_CALLBACK_URL: z.string().min(1, { message: "FRONTEND_CALLBACK_URL is required" }),
	PDF_MAX_MB: z.string().min(1).max(500).default("100"),
	CLOUDINARY_CLOUD_NAME: z.string().min(1, { message: "CLOUDINARY_CLOUD_NAME is required" }),
	CLOUDINARY_API_KEY: z.string().min(1, { message: "CLOUDINARY_API_KEY is required" }),
	CLOUDINARY_API_SECRET: z.string().min(1, { message: "CLOUDINARY_API_SECRET is required" }),
});
export type EnvConfig = z.infer<typeof EnvConfigSchema>;

const rawConfig = {
	DATABASE_URL: process.env.DATABASE_URL,
	PORT: process.env.PORT,
	NODE_ENV: process.env.NODE_ENV,
	RESEND_API_KEY: process.env.RESEND_API_KEY,
	REDIS_HOST: process.env.REDIS_HOST,
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_DB: process.env.REDIS_DB,
	JWT_SECRET: process.env.JWT_SECRET,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
	FRONTEND_CALLBACK_URL: process.env.FRONTEND_CALLBACK_URL,
	PDF_MAX_MB: process.env.PDF_MAX_MB,
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

let envVars: EnvConfig;

try {
	envVars = EnvConfigSchema.parse(rawConfig);
	logger.info("Environment configuration loaded.");
} catch (error) {
	if (error instanceof z.ZodError) {
		logger.error("Environment configuration validation failed:", error.issues);
		error.issues.forEach((err) => {
			logger.error(`- ${err.path.join(".")}: ${err.message}`);
		});
	} else {
		logger.error("Unknown error during environment config validation:", error);
	}
	throw new Error("Environment configuration validation failed. Check environment variables.");
}

export const {
	DATABASE_URL,
	PORT,
	NODE_ENV,
	RESEND_API_KEY,
	REDIS_HOST,
	REDIS_PORT,
	REDIS_DB,
	JWT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_CALLBACK_URL,
	FRONTEND_CALLBACK_URL,
	PDF_MAX_MB,
	CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET,
} = envVars;

export default envVars;
