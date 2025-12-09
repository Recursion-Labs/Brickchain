import { Router } from "express";
import propertyRoutes from "./property.routes";
import listingRoutes from "./listing.routes";
import bidRoutes from "./bid.routes";
import blockchainRoutes from "./blockchain.routes";

const router = Router();

router.use("/properties", propertyRoutes);
router.use("/listings", listingRoutes);
router.use("/bids", bidRoutes);
router.use("/blockchain", blockchainRoutes);

export default router;
