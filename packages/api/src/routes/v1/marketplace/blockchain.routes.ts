import { Router } from "express";
import { v1 } from "@/controllers";
import asyncHandler from "@/handlers/async.handler";

const router = Router();

router.get("/status", asyncHandler(v1.marketplace.blockchain.getStatus));
router.get("/tx/:txHash", asyncHandler(v1.marketplace.blockchain.getTransaction));
router.get("/tx/:txHash/wait", asyncHandler(v1.marketplace.blockchain.waitForTransaction));

export default router;
