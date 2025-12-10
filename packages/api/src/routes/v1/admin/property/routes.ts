import { v1 } from "@/controllers";
import { authenticate, requireAdmin } from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.post("/", v1.admin.propertyControllers.manageProperty.addProperty);
router.put("/:id", v1.admin.propertyControllers.manageProperty.updateProperty);
router.delete("/:id", v1.admin.propertyControllers.manageProperty.deleteProperty);

router.put("/request/status", v1.admin.propertyControllers.requestController.updateRequest);

export default router;
