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
	const minecraftToken = req.headers['x-minecraft-token'] as string;

	// Try JWT authentication first
	if (token) {
		return new Promise<void>((resolve) => {
			jwt.verify(token, envVars.JWT_SECRET, async (err, decodedToken) => {
				if (!err) {
					const userId = (decodedToken as any).id;
					if (userId) {
						try {
							const userAccount = await db.user.findFirst({
								where: { id: userId },
							});
							if (userAccount) {
								(req as any).user = userAccount;
								next();
								return resolve();
							}
						} catch (error) {
							next(error);
							return resolve();
						}
					}
				}
				// JWT failed, try Minecraft auth
				tryMinecraftAuth();
				resolve();
			});
		});
	} else {
		// No JWT token, try Minecraft auth
		tryMinecraftAuth();
	}

	async function tryMinecraftAuth() {
		if (minecraftToken) {
			try {
				const userAccount = await db.user.findFirst({
					where: { minecraftAuthToken: minecraftToken },
				});

				if (userAccount) {
					(req as any).user = userAccount;
					next();
					return;
				}
			} catch (error) {
				next(error);
				return;
			}
		}

		// Both authentication methods failed
		res.status(401).json({ message: "Authentication Failed: Please provide a valid JWT token or Minecraft token" });
	}
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
	const user = (req as any).user;
	if (!user || user.role !== 'ADMIN') {
		res.status(403).json({ message: "Access denied: Admin role required" });
		return;
	}
	next();
};
