import { db } from "@/config/database";
import { PropertyStatus } from "../../../generated/prisma/client";

interface CreatePropertyData {
  propertyId: string;
  owner: string;
  valuation: string;
  locationHash: string;
  documentHash: string;
  name?: string;
  description?: string;
  type?: string;
  location?: string;
}

interface PropertyFilters {
  status?: PropertyStatus;
  owner?: string;
  minValuation?: string;
  maxValuation?: string;
}

interface Pagination {
  page: number;
  limit: number;
}

export class PropertyService {
  async createProperty(data: CreatePropertyData) {
    return await db.property.create({
      data: {
        propertyId: data.propertyId,
        owner: data.owner,
        valuation: data.valuation,
        locationHash: data.locationHash,
        documentHash: data.documentHash,
        status: PropertyStatus.ACTIVE,
        name: data.name || "Untitled Property",
        description: data.description || "",
        documentId: data.documentHash,
        type: "RESIDENTIAL",
        location: data.location || "",
        value: parseFloat(data.valuation) || 0,
        shares: 0,
      },
    });
  }

  async getPropertyById(id: string) {
    const property = await db.property.findUnique({
      where: { id },
      include: {
        gallery: true,
        listings: true,
      },
    });

    if (!property) {
      throw new Error("Property not found");
    }

    return property;
  }

  async getPropertyByPropertyId(propertyId: string) {
    const property = await db.property.findUnique({
      where: { propertyId },
      include: {
        gallery: true,
        listings: true,
      },
    });

    if (!property) {
      throw new Error("Property not found");
    }

    return property;
  }

  async listProperties(filters: PropertyFilters, pagination: Pagination) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.owner) {
      where.owner = filters.owner;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const [data, total] = await Promise.all([
      db.property.findMany({
        where,
        skip,
        take: pagination.limit,
        include: {
          gallery: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.property.count({ where }),
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

  async updatePropertyStatus(propertyId: string, status: PropertyStatus) {
    return await db.property.update({
      where: { propertyId },
      data: { status },
    });
  }

  async deleteProperty(propertyId: string) {
    return await db.property.delete({
      where: { propertyId },
    });
  }
}
