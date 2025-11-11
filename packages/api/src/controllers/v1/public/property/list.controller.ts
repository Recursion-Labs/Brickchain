import { db } from "@/config/database";
import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";
import { PropertyDTO } from "@/@types/interface";

const listProperties = catchAsync(async (req: Request, res: Response) => {
    try {
        const properties = await db.property.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                location: true,
                value: true,
                shares: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        const propertiesDTO: PropertyDTO[] = properties.map(prop => ({
            id: prop.id,
            name: prop.name,
            description: prop.description,
            type: prop.type,
            Location: prop.location,
            Value: prop.value,
            Shares: prop.shares,
            createdAt: prop.createdAt,
            updatedAt: prop.updatedAt,
        }));
        res.status(200).json({
            success: true,
            data: propertiesDTO
        });
    } catch (error) {
        throw new APIError(500, "Failed to fetch properties");
    }
});

export default {
    listProperties
}