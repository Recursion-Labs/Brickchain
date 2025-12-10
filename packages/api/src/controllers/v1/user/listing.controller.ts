import { Request, Response } from "express";
import { z } from "zod";
import * as crypto from "crypto";
import { ListingService } from "@/services/listing.service";
import { ListingStatus } from "generated/prisma/client";

const listingService = new ListingService();

const createListingSchema = z.object({
	propertyId: z.string().startsWith("0x"),
	price: z.string(),
	durationSeconds: z.number().min(0),
});

const updateListingSchema = z.object({
	price: z.string(),
});

const listingFilterSchema = z.object({
	status: z.nativeEnum(ListingStatus).optional(),
	propertyId: z.string().optional(),
	sellerId: z.string().optional(),
	minPrice: z.string().optional(),
	maxPrice: z.string().optional(),
});

const paginationSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
});

export const createListing = async (req: Request, res: Response) => {
	const data = createListingSchema.parse(req.body);

	// TODO: Get user from auth middleware
	const userId = (req as any).user?.id || "temp-user-id";

	// Generate listing ID (bytes32 format for blockchain)
	const listingId = "0x" + crypto.randomBytes(32).toString("hex");

	// TODO: Create on blockchain first
	const listing = await listingService.createListing({
		listingId,
		propertyId: data.propertyId,
		sellerId: userId,
		price: data.price,
		durationSeconds: data.durationSeconds,
	});

	res.status(201).json({
		success: true,
		data: {
			...listing,
			blockchain: {
				txHash: "0x" + "0".repeat(64),
				blockHash: "0x" + "0".repeat(64),
			},
		},
		message: "Listing created successfully",
	});
};

export const getListing = async (req: Request, res: Response) => {
	const { id } = req.params;
	const listing = await listingService.getListingById(id);

	res.json({
		success: true,
		data: listing,
	});
};

export const getListingByListingId = async (req: Request, res: Response) => {
	const { listingId } = req.params;
	const listing = await listingService.getListingByListingId(listingId);

	res.json({
		success: true,
		data: listing,
	});
};

export const listListings = async (req: Request, res: Response) => {
	const filters = listingFilterSchema.parse(req.query);
	const pagination = paginationSchema.parse(req.query);

	const result = await listingService.listListings(filters, pagination);

	res.json({
		success: true,
		data: result.data,
		...result.pagination,
	});
};

export const updateListing = async (req: Request, res: Response) => {
	const { listingId } = req.params;
	const data = updateListingSchema.parse(req.body);

	const listing = await listingService.updateListingPrice(listingId, data.price);

	res.json({
		success: true,
		data: listing,
		message: "Listing updated successfully",
	});
};

export const cancelListing = async (req: Request, res: Response) => {
	const { listingId } = req.params;
	const userId = (req as any).user?.id;
	const listing = await listingService.cancelListing(listingId, userId);
	res.json({
		success: true,
		data: listing,
		message: "Listing cancelled successfully",
	});
};
