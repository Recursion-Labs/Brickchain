import { Request, Response } from "express";
import { z } from "zod";
import { BidService } from "@/services/marketplace";
import { BidStatus } from "../../../../generated/prisma/client";

const bidService = new BidService();

const createBidSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.string(),
  message: z.string().optional(),
});

const bidFilterSchema = z.object({
  status: z.nativeEnum(BidStatus).optional(),
  listingId: z.string().optional(),
  bidderId: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const createBid = async (req: Request, res: Response) => {
  const data = createBidSchema.parse(req.body);
  
  // TODO: Get user from auth middleware
  const userId = (req as any).user?.id || "temp-user-id";
  
  const bid = await bidService.createBid({
    listingId: data.listingId,
    bidderId: userId,
    amount: data.amount,
    message: data.message,
  });
  
  res.status(201).json({
    success: true,
    data: bid,
    message: "Bid created successfully",
  });
};

export const getBid = async (req: Request, res: Response) => {
  const { id } = req.params;
  const bid = await bidService.getBidById(id);
  
  res.json({
    success: true,
    data: bid,
  });
};

export const listBids = async (req: Request, res: Response) => {
  const filters = bidFilterSchema.parse(req.query);
  const pagination = paginationSchema.parse(req.query);
  
  const result = await bidService.listBids(filters, pagination);
  
  res.json({
    success: true,
    data: result.data,
    ...result.pagination,
  });
};

export const getBidsForListing = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const pagination = paginationSchema.parse(req.query);
  
  const result = await bidService.getBidsForListing(listingId, pagination);
  
  res.json({
    success: true,
    data: result.data,
    ...result.pagination,
  });
};

export const getMyBids = async (req: Request, res: Response) => {
  const pagination = paginationSchema.parse(req.query);
  
  // TODO: Get user from auth middleware
  const userId = (req as any).user?.id || "temp-user-id";
  
  const result = await bidService.getBidsByBidder(userId, pagination);
  
  res.json({
    success: true,
    data: result.data,
    ...result.pagination,
  });
};

export const acceptBid = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // TODO: Get user from auth middleware
  const userId = (req as any).user?.id || "temp-user-id";
  
  const bid = await bidService.acceptBid(id, userId);
  
  res.json({
    success: true,
    data: bid,
    message: "Bid accepted successfully",
  });
};

export const rejectBid = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // TODO: Get user from auth middleware
  const userId = (req as any).user?.id || "temp-user-id";
  
  const bid = await bidService.rejectBid(id, userId);
  
  res.json({
    success: true,
    data: bid,
    message: "Bid rejected successfully",
  });
};

export const withdrawBid = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // TODO: Get user from auth middleware
  const userId = (req as any).user?.id || "temp-user-id";
  
  const bid = await bidService.withdrawBid(id, userId);
  
  res.json({
    success: true,
    data: bid,
    message: "Bid withdrawn successfully",
  });
};
