import type { Request, Response, NextFunction } from "express";

interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

const rateLimitStore: RateLimitStore = {};

const RATE_LIMIT = 5; // 5 requests
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const ip = req.ip || req.socket.remoteAddress || "unknown";
	const key = `waitlist_${ip}`;
	const now = Date.now();

	if (!rateLimitStore[key]) {
		rateLimitStore[key] = { count: 0, resetTime: now + WINDOW_MS };
	}

	if (now > rateLimitStore[key].resetTime) {
		rateLimitStore[key] = { count: 0, resetTime: now + WINDOW_MS };
	}

	if (rateLimitStore[key].count >= RATE_LIMIT) {
		res.status(429).json({
			status: "error",
			message: "Too many requests. Please try again later.",
		});
		return;
	}

	rateLimitStore[key].count++;
	next();
};
