import { v1 } from "@/controllers";
import { Router } from "express";

const router = Router();

router.post("/register", v1.auth.authControllers.register);
router.post("/login", v1.auth.authControllers.login)

router.post("/otp/send", v1.auth.authControllers.sendOtp);
router.post("/otp/verify", v1.auth.authControllers.verifyOtp);

router.get("/google", v1.auth.googleControllers.googleAuth);
router.get(
    "/google/callback",
    v1.auth.googleControllers.googleCallback
);

export default router;
