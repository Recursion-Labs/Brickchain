import { db } from "@/config/database";
import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";

const addProperty = catchAsync(async (req: Request, res: Response) => {
    const { name, description, documentId, type, location, value, shares } = req.body;
    if (!name || !description || !documentId || !type || !location || value === undefined || shares === undefined) {
        throw new APIError(400, "All fields are required: name, description, documentId, type, location, value, shares");
    }
    // Validate type is a valid PropertyType
    const validTypes = ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "LAND", "MULTI_FAMILY", "OFFICE_BUILDING", "RETAIL", "MIXED_USE"];
    if (!validTypes.includes(type)) {
        throw new APIError(400, "Invalid property type");
    }
    try {
        const property = await db.property.create({
            data: {
                name,
                description,
                documentId,
                type,
                location,
                value: parseFloat(value),
                shares: parseInt(shares),
            }
        });
        res.status(201).json({
            success: true,
            message: "Property created successfully",
            data: property
        });
    } catch (error) {
        console.error('[Property] Create property error:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        throw new APIError(500, `Failed to create property: ${errorMsg}`);
    }
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, documentId, type, Location, Value, Shares } = req.body;
    if (!id) {
        throw new APIError(400, "Property ID is required");
    }
    // Validate type if provided
    if (type) {
        const validTypes = ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "LAND", "MULTI_FAMILY", "OFFICE_BUILDING", "RETAIL", "MIXED_USE"];
        if (!validTypes.includes(type)) {
            throw new APIError(400, "Invalid property type");
        }
    }
    try {
        const updateData: any = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (documentId) updateData.documentId = documentId;
        if (type) updateData.type = type;
        if (Location) updateData.Location = Location;
        if (Value !== undefined) updateData.Value = parseFloat(Value);
        if (Shares !== undefined) updateData.Shares = parseInt(Shares);

        const property = await db.property.update({
            where: { id },
            data: updateData
        });
        res.status(200).json({
            success: true,
            message: "Property updated successfully",
            data: property
        });
    } catch (error) {
        if ((error as any).code === 'P2025') {
            throw new APIError(404, "Property not found");
        }
        throw new APIError(500, "Failed to update property");
    }
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        throw new APIError(400, "Property ID is required");
    }
    try {
        await db.property.delete({
            where: { id }
        });
        res.status(200).json({
            success: true,
            message: "Property deleted successfully"
        });
    } catch (error) {
        if ((error as any).code === 'P2025') {
            throw new APIError(404, "Property not found");
        }
        throw new APIError(500, "Failed to delete property");
    }
});

export default {
    addProperty,
    updateProperty,
    deleteProperty
}