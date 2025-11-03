import { Router } from "express";
import contactController from "@/controllers/v1/public/contact.controller";

const router = Router();

router.post("/contact", contactController.contact);

export default router;
