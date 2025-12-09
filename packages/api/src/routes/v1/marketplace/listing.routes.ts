import { Router } from "express";
import { v1 } from "@/controllers";
import asyncHandler from "@/handlers/async.handler";

const router = Router();

router.post("/", asyncHandler(v1.marketplace.listing.createListing));
router.get("/", asyncHandler(v1.marketplace.listing.listListings));
router.get("/:id", asyncHandler(v1.marketplace.listing.getListing));
router.get("/chain/:listingId", asyncHandler(v1.marketplace.listing.getListingByListingId));
router.patch("/:listingId", asyncHandler(v1.marketplace.listing.updateListing));
router.post("/:listingId/cancel", asyncHandler(v1.marketplace.listing.cancelListing));

export default router;
