import { Router } from "express";
import { Request, Response } from "express";

const router = Router()

router.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        message: "API is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

export default router;