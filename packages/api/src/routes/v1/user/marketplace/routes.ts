import { v1 } from "@/controllers";
import { Router } from "express";

const router = Router();

router.post("/listing", v1.publicControllers.marketplaceControllers.listingController.createListing);
router.get("/listing", v1.publicControllers.marketplaceControllers.listingController.getListing);
router.get("/listing/:id", v1.publicControllers.marketplaceControllers.listingController.getListingByListingId);
router.put("/listing/:id", v1.publicControllers.marketplaceControllers.listingController.updateListing);
router.delete("/listing/:id", v1.publicControllers.marketplaceControllers.listingController.cancelListing);

export default router;
