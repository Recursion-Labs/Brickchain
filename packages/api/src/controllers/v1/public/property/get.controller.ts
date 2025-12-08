import { db } from "@/config/database";
import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";
import { PropertyDTO } from "@/@types/interface";

const getProperty = catchAsync(async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new APIError(400, "Property ID is required");
        }

        const property = await db.property.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                location: true,
                value: true,
                shares: true,
                documentId: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!property) {
            throw new APIError(404, "Property not found");
        }

        const propertyDTO: PropertyDTO = {
            id: property.id,
            name: property.name,
            description: property.description,
            type: property.type,
            Location: property.location,
            Value: property.value,
            Shares: property.shares,
            createdAt: property.createdAt,
            updatedAt: property.updatedAt,
        };

        res.status(200).json({
            success: true,
            data: propertyDTO
        });
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError(500, "Failed to fetch property");
    }
});

export default {
    getProperty
}
