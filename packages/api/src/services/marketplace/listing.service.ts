import { db } from "@/config/database";
import { ListingStatus } from "../../../generated/prisma/client";

interface CreateListingData {
  listingId: string;
  propertyId: string;
  sellerId: string;
  price: string;
  durationSeconds: number;
}

interface ListingFilters {
  status?: ListingStatus;
  propertyId?: string;
  sellerId?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface Pagination {
  page: number;
  limit: number;
}

export class ListingService {
  async createListing(data: CreateListingData) {
    // Find the property by on-chain propertyId
    const property = await db.property.findUnique({
      where: { propertyId: data.propertyId },
    });

    if (!property) {
      throw new Error("Property not found");
    }

    const expiresAt = new Date(Date.now() + data.durationSeconds * 1000);

    return await db.marketplaceListing.create({
      data: {
        listingId: data.listingId,
        propertyId: data.propertyId,
        propertyDbId: property.id,
        sellerId: data.sellerId,
        price: data.price,
        status: ListingStatus.ACTIVE,
        expiresAt,
      },
      include: {
        property: true,
        seller: true,
      },
    });
  }

  async getListingById(id: string) {
    const listing = await db.marketplaceListing.findUnique({
      where: { id },
      include: {
        property: true,
        seller: true,
        bids: true,
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    return listing;
  }

  async getListingByListingId(listingId: string) {
    const listing = await db.marketplaceListing.findUnique({
      where: { listingId },
      include: {
        property: true,
        seller: true,
        bids: true,
      },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    return listing;
  }

  async listListings(filters: ListingFilters, pagination: Pagination) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.propertyId) {
      where.propertyId = filters.propertyId;
    }

    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      db.marketplaceListing.findMany({
        where,
        skip,
        take: pagination.limit,
        include: {
          property: true,
          seller: {
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
      db.marketplaceListing.count({ where }),
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

  async updateListingPrice(listingId: string, price: string) {
    return await db.marketplaceListing.update({
      where: { listingId },
      data: { price },
    });
  }

  async cancelListing(listingId: string, userId: string) {
    const listing = await db.marketplaceListing.findUnique({
      where: { listingId },
    });

    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.sellerId !== userId) {
      throw new Error("Unauthorized: Only the seller can cancel this listing");
    }

    return await db.marketplaceListing.update({
      where: { listingId },
      data: { status: ListingStatus.CANCELLED },
    });
  }

  async expireListings() {
    const result = await db.marketplaceListing.updateMany({
      where: {
        status: ListingStatus.ACTIVE,
        expiresAt: {
          lte: new Date(),
        },
      },
      data: {
        status: ListingStatus.EXPIRED,
      },
    });

    return result.count;
  }
}
