import catchAsync from "@/handlers/async.handler";
import type { Request, Response } from "express";
import passport from "@/strategies/google.strategy";
import { APIError } from "@/utils/APIerror";
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "@/services/jwt.service";
import { User } from "generated/prisma/client";

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

			res.status(200).json({
				message: "Google login successful",
				user,
				accessToken,
				refreshToken,
			});
			return;
		} catch (error: unknown) {
			throw new APIError(500, "Google authentication failed");
		}
	}),
];

export default {
	googleAuth,
	googleCallback,
};
