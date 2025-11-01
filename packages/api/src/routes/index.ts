import { Router } from "express";
import { Request, Response } from "express";
import v1Routes from "./v1/index";

const router = Router();

router.use("/v1", v1Routes);

router.get("/health", (req: Request, res: Response) => {
	res.status(200).json({
		message: "API is healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

export default router;
