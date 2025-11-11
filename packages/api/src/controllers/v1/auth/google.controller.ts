import catchAsync from "@/handlers/async.handler";
import type { Request, Response } from "express";
import passport from "@/strategies/google.strategy";
import { APIError } from "@/utils/APIerror";
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "@/services/jwt.service";
import { User } from "generated/prisma/client";
import envVars from "@/config/envVars";

const googleAuth = passport.authenticate("google", {
	scope: ["profile", "email"],
});

const googleCallback = [
	passport.authenticate("google", { failureRedirect: "/login" }),
	catchAsync(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new APIError(401, "Google authentication failed");
		}
		try {
			const user = req.user as User;
			const jti = uuidv4();
			const { accessToken, refreshToken } = await generateTokens(user, jti);

			// Redirect to frontend callback page with tokens as query parameters
			const frontendCallbackUrl = envVars.FRONTEND_CALLBACK_URL || "http://localhost:3000/auth/google/callback";
			console.log("Access Token:", accessToken)
			const redirectUrl = `${frontendCallbackUrl}?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&user=${encodeURIComponent(JSON.stringify(user))}`;

			res.redirect(redirectUrl);
		} catch (error: unknown) {
			throw new APIError(500, "Google authentication failed");
		}
	}),
];

export default {
	googleAuth,
	googleCallback,
};
