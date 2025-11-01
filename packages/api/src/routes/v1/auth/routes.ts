import { v1 } from "@/controllers";
import { Router } from "express";

const router = Router();

router.post("/register", v1.auth.authControllers.register);

router.post("/otp/send", v1.auth.authControllers.sendOtp);
router.post("/otp/verify", v1.auth.authControllers.verifyOtp);

export default router;
