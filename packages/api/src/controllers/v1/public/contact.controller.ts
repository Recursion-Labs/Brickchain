import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";
import { sendConfirmationEmail } from "@/services/resend.service";
import { logger } from "@/utils/logger";

interface ContactInput {
	name: string;
	email: string;
	subject: string;
	message: string;
}

const contact = catchAsync(async (req: Request, res: Response) => {
	const { name, email, subject, message } = req.body as ContactInput;

	if (!name || !email || !subject || !message) {
		throw new APIError(400, "All fields are required");
	}

	try {
		await sendConfirmationEmail(email);
		res.status(200).json({ message: "Message sent successfully" });
	} catch (error) {
		logger.error("[ CONTACT ] : failed to send confirmation email : ", error);
		throw new APIError(500, "Failed to send message");
	}
});

export default {
	contact,
};