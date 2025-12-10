import { Router } from "express";
import {
    registerProperty,
    getProperty,
    getPropertyByPropertyId,
    listProperties,
    updatePropertyStatus,
    deleteProperty
} from "@/controllers/v1/public/marketplace/property.controller";

const router = Router();

// Register a new property
router.post("/", registerProperty);

// Get property by database ID
router.get("/:id", getProperty);

// Get property by blockchain property ID
router.get("/property/:propertyId", getPropertyByPropertyId);

// List properties with filters and pagination
router.get("/", listProperties);

// Update property status
router.put("/:propertyId/status", updatePropertyStatus);

// Delete property
router.delete("/:propertyId", deleteProperty);

export default router;
