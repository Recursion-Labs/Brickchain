import { v1 } from "@/controllers";
import { authenticate } from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.get("/@me", authenticate, v1.user.profileController.getUserByToken);

export default router;
