import { Router } from "express";
import { v1 } from "@/controllers";
import asyncHandler from "@/handlers/async.handler";

const router = Router();

router.post("/", asyncHandler(v1.marketplace.bid.createBid));
router.get("/", asyncHandler(v1.marketplace.bid.listBids));
router.get("/my", asyncHandler(v1.marketplace.bid.getMyBids));
router.get("/:id", asyncHandler(v1.marketplace.bid.getBid));
router.get("/listing/:listingId", asyncHandler(v1.marketplace.bid.getBidsForListing));
router.post("/:id/accept", asyncHandler(v1.marketplace.bid.acceptBid));
router.post("/:id/reject", asyncHandler(v1.marketplace.bid.rejectBid));
router.post("/:id/withdraw", asyncHandler(v1.marketplace.bid.withdrawBid));

export default router;
