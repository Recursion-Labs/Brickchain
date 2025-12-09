import { Router } from "express";
import { v1 } from "@/controllers";
import asyncHandler from "@/handlers/async.handler";

const router = Router();

router.post("/", asyncHandler(v1.marketplace.property.registerProperty));
router.get("/", asyncHandler(v1.marketplace.property.listProperties));
router.get("/:id", asyncHandler(v1.marketplace.property.getProperty));
router.get("/chain/:propertyId", asyncHandler(v1.marketplace.property.getPropertyByPropertyId));
router.patch("/:propertyId/status", asyncHandler(v1.marketplace.property.updatePropertyStatus));
router.delete("/:propertyId", asyncHandler(v1.marketplace.property.deleteProperty));

export default router;
