import { db } from "@/config/database";
import envVars from "@/config/envVars";
import { Request, Response, NextFunction } from "express";
import { User as user } from "generated/prisma/client";
import jwt from "jsonwebtoken";

declare global {
	namespace Express {
		interface User extends user {}
	}
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(" ")[1];

	if (token == null) {
		res.status(401).json({ message: "Authentication Failed: Please provide a token to verify" });
		return;
	}

	return new Promise<void>((resolve) => {
		jwt.verify(token, envVars.JWT_SECRET, async (err, decodedToken) => {
			if (err) {
				res.status(403).json({ message: "Invalid token" });
				return resolve();
			}
			const userId = (decodedToken as any).id;
			if (!userId) {
				res.status(403).json({ message: "Invalid token: Missing userId" });
				return resolve();
			}
			try {
				const userAccount = await db.user.findFirst({
					where: { id: userId },
				});
				if (!userAccount) {
					res.status(404).json({ message: "User not found" });
					return resolve();
				}
				(req as any).user = userAccount;
				next();
				resolve();
			} catch (error) {
				next(error);
				resolve();
			}
		});
	});
};
