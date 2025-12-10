import { db } from "@/config/database";
import { BidStatus, ListingStatus } from "generated/prisma/enums";

interface CreateBidData {
	listingId: string;
	bidderId: string;
	amount: string;
	message?: string;
}

interface BidFilters {
	status?: BidStatus;
	listingId?: string;
	bidderId?: string;
}

interface Pagination {
	page: number;
	limit: number;
}

export class BidService {
	async createBid(data: CreateBidData) {
		// Verify listing exists and is active
		const listing = await db.marketplaceListing.findUnique({
			where: { id: data.listingId },
		});

		if (!listing) {
			throw new Error("Listing not found");
		}

		if (listing.status !== ListingStatus.ACTIVE) {
			throw new Error("Listing is not active");
		}

		if (listing.expiresAt < new Date()) {
			throw new Error("Listing has expired");
		}

		if (listing.sellerId === data.bidderId) {
			throw new Error("Cannot bid on your own listing");
		}

		return await db.bid.create({
			data: {
				listingId: data.listingId,
				bidderId: data.bidderId,
				amount: data.amount,
				message: data.message,
				status: BidStatus.PENDING,
			},
			include: {
				listing: true,
				bidder: {
					select: {
						id: true,
						name: true,
						email: true,
						walletAddress: true,
					},
				},
			},
		});
	}

	async getBidById(id: string) {
		const bid = await db.bid.findUnique({
			where: { id },
			include: {
				listing: {
					include: {
						property: true,
					},
				},
				bidder: {
					select: {
						id: true,
						name: true,
						email: true,
						walletAddress: true,
					},
				},
			},
		});

		if (!bid) {
			throw new Error("Bid not found");
		}

		return bid;
	}

	async listBids(filters: BidFilters, pagination: Pagination) {
		const where: any = {};

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.listingId) {
			where.listingId = filters.listingId;
		}

		if (filters.bidderId) {
			where.bidderId = filters.bidderId;
		}

		const skip = (pagination.page - 1) * pagination.limit;

		const [data, total] = await Promise.all([
			db.bid.findMany({
				where,
				skip,
				take: pagination.limit,
				include: {
					listing: true,
					bidder: {
						select: {
							id: true,
							name: true,
							email: true,
							walletAddress: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			}),
			db.bid.count({ where }),
		]);

		return {
			data,
			pagination: {
				page: pagination.page,
				limit: pagination.limit,
				total,
				totalPages: Math.ceil(total / pagination.limit),
			},
		};
	}

	async getBidsForListing(listingId: string, pagination: Pagination) {
		const skip = (pagination.page - 1) * pagination.limit;

		const [data, total] = await Promise.all([
			db.bid.findMany({
				where: { listingId },
				skip,
				take: pagination.limit,
				include: {
					bidder: {
						select: {
							id: true,
							name: true,
							email: true,
							walletAddress: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			}),
			db.bid.count({ where: { listingId } }),
		]);

		return {
			data,
			pagination: {
				page: pagination.page,
				limit: pagination.limit,
				total,
				totalPages: Math.ceil(total / pagination.limit),
			},
		};
	}

	async getBidsByBidder(bidderId: string, pagination: Pagination) {
		const skip = (pagination.page - 1) * pagination.limit;

		const [data, total] = await Promise.all([
			db.bid.findMany({
				where: { bidderId },
				skip,
				take: pagination.limit,
				include: {
					listing: {
						include: {
							property: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			}),
			db.bid.count({ where: { bidderId } }),
		]);

		return {
			data,
			pagination: {
				page: pagination.page,
				limit: pagination.limit,
				total,
				totalPages: Math.ceil(total / pagination.limit),
			},
		};
	}

	async acceptBid(id: string, userId: string) {
		const bid = await db.bid.findUnique({
			where: { id },
			include: { listing: true },
		});

		if (!bid) {
			throw new Error("Bid not found");
		}

		if (bid.listing.sellerId !== userId) {
			throw new Error("Unauthorized: Only the seller can accept bids");
		}

		if (bid.status !== BidStatus.PENDING) {
			throw new Error("Bid is not in pending status");
		}

		// Update bid status and listing status
		const [updatedBid] = await db.$transaction([
			db.bid.update({
				where: { id },
				data: { status: BidStatus.ACCEPTED },
			}),
			db.marketplaceListing.update({
				where: { id: bid.listingId },
				data: { status: ListingStatus.SOLD },
			}),
			// Reject all other pending bids for this listing
			db.bid.updateMany({
				where: {
					listingId: bid.listingId,
					id: { not: id },
					status: BidStatus.PENDING,
				},
				data: { status: BidStatus.REJECTED },
			}),
		]);

		return updatedBid;
	}

	async rejectBid(id: string, userId: string) {
		const bid = await db.bid.findUnique({
			where: { id },
			include: { listing: true },
		});

		if (!bid) {
			throw new Error("Bid not found");
		}

		if (bid.listing.sellerId !== userId) {
			throw new Error("Unauthorized: Only the seller can reject bids");
		}

		if (bid.status !== BidStatus.PENDING) {
			throw new Error("Bid is not in pending status");
		}

		return await db.bid.update({
			where: { id },
			data: { status: BidStatus.REJECTED },
		});
	}

	async withdrawBid(id: string, userId: string) {
		const bid = await db.bid.findUnique({
			where: { id },
		});

		if (!bid) {
			throw new Error("Bid not found");
		}

		if (bid.bidderId !== userId) {
			throw new Error("Unauthorized: Only the bidder can withdraw this bid");
		}

		if (bid.status !== BidStatus.PENDING) {
			throw new Error("Bid is not in pending status");
		}

		return await db.bid.update({
			where: { id },
			data: { status: BidStatus.WITHDRAWN },
		});
	}

	async expireBids() {
		// Expire bids for expired listings
		const result = await db.bid.updateMany({
			where: {
				status: BidStatus.PENDING,
				listing: {
					expiresAt: {
						lte: new Date(),
					},
				},
			},
			data: {
				status: BidStatus.EXPIRED,
			},
		});

		return result.count;
	}
}
