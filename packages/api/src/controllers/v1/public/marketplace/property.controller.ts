import { PropertyService } from "@/services/property.service";
import { Request, Response } from "express";
import { PropertyStatus } from "generated/prisma/enums";
import { z } from "zod";

const propertyService = new PropertyService();

const registerPropertySchema = z.object({
	propertyId: z.string().startsWith("0x"),
	owner: z.string().startsWith("0x"),
	valuation: z.string(),
	locationHash: z.string(),
	documentHash: z.string(),
	name: z.string().optional(),
	description: z.string().optional(),
	location: z.string().optional(),
});

const propertyFilterSchema = z.object({
	status: z.nativeEnum(PropertyStatus).optional(),
	owner: z.string().optional(),
	minValuation: z.string().optional(),
	maxValuation: z.string().optional(),
});

const paginationSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
});

export const registerProperty = async (req: Request, res: Response) => {
	const data = registerPropertySchema.parse(req.body);

	// TODO: Integrate with blockchain service
	const property = await propertyService.createProperty(data);

	res.status(201).json({
		success: true,
		data: {
			...property,
			blockchain: {
				txHash: "0x" + "0".repeat(64),
				blockHash: "0x" + "0".repeat(64),
			},
		},
		message: "Property registered successfully",
	});
};

export const getProperty = async (req: Request, res: Response) => {
	const { id } = req.params;
	const property = await propertyService.getPropertyById(id);

	res.json({
		success: true,
		data: property,
	});
};

export const getPropertyByPropertyId = async (req: Request, res: Response) => {
	const { propertyId } = req.params;
	const property = await propertyService.getPropertyByPropertyId(propertyId);

	res.json({
		success: true,
		data: property,
	});
};

export const listProperties = async (req: Request, res: Response) => {
	const filters = propertyFilterSchema.parse(req.query);
	const pagination = paginationSchema.parse(req.query);

	const result = await propertyService.listProperties(filters, pagination);

	res.json({
		success: true,
		data: result.data,
		...result.pagination,
	});
};

export const updatePropertyStatus = async (req: Request, res: Response) => {
	const { propertyId } = req.params;
	const { status } = req.body;

	const property = await propertyService.updatePropertyStatus(propertyId, status);

	res.json({
		success: true,
		data: property,
		message: "Property status updated",
	});
};

export const deleteProperty = async (req: Request, res: Response) => {
	const { propertyId } = req.params;

	await propertyService.deleteProperty(propertyId);

	res.json({
		success: true,
		message: "Property deleted successfully",
	});
};
