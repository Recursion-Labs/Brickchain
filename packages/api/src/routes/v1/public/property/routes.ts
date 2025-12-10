import { v1 } from "@/controllers";
import { Router } from "express";

const router = Router();

router.get("/", v1.publicControllers.propertyControllers.propertyListController.listProperties);

export default router;
