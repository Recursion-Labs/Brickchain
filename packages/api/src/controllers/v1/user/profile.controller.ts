import catchAsync from "@/handlers/async.handler";
import { Request, Response } from "express";

const getUserByToken = catchAsync(async (req: Request, res: Response) => {
    
})

export default {
    getUserByToken
}