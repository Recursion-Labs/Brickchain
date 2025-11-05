import envVars from "@/config/envVars";
import { User } from "generated/prisma/client";
import jwt from "jsonwebtoken";

export async function generateTokens(user: User, jti: string) {
	const accessToken = jwt.sign({ id: user.id, role: user.role, jti }, envVars.JWT_SECRET, { expiresIn: "7d" });
	const refreshToken = jwt.sign({ id: user.id, role: user.role, jti }, envVars.JWT_SECRET, { expiresIn: "30d" });
	return {
		accessToken,
		refreshToken,
	};
}

export async function verifyToken(token: string) {
	try {
		const secret = envVars.JWT_SECRET;
		if (!secret) {
			throw new Error("JWT secret is not defined");
		}
		const decoded = jwt.verify(token, secret);
		return decoded;
	} catch (error) {
		throw new Error("Invalid token");
	}
}
