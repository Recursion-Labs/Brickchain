import catchAsync from "@/handlers/async.handler";
import { Request, Response } from "express";

const registerWallet = catchAsync(async (req: Request, res: Response) => {});

export default {
	registerWallet,
};
