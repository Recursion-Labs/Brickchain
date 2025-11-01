import { RegisterInput, SendOtpInput } from "@/@types/interface";
import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";

const register = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body as RegisterInput;
    if (!email) {
        throw new APIError(400, "Email is required")
    }
})

const sendOtp = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body as SendOtpInput;
    if (!email || !otp) {
        throw new APIError(400, "Email and OTP are required")
    }
})

export default {
    register,
    sendOtp
}