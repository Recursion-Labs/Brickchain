import { v1 } from "@/controllers";
import { Router } from "express";

const router = Router()

router.post("/register", v1.auth.authControllers.register)

export default router;