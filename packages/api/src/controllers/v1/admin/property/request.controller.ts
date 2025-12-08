import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";

const updateRequest = catchAsync(async (req: Request, res: Response) => {
    const id = req.query.id as string;
    if (!id) {
        throw new APIError(400, "Request ID is required");
    }
})

export default {
    updateRequest
}