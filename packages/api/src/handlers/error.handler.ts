import { APIError } from "@/utils/APIerror";
import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorConverter: ErrorRequestHandler = (err, _req: Request, _res: Response, next) => {
	let error = err;
	if (!(error instanceof APIError)) {
		const statusCode = 400;
		const message = error.message || statusCode;
		error = new APIError(statusCode, message);
	}
	next(error);
};

export const errorHandler: ErrorRequestHandler = (err: APIError, _req: Request, res: Response, _next: NextFunction) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || statusCode;
	const response = {
		code: statusCode,
		message,
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	};
	if (process.env.NODE_ENV === "development") {
		console.error(err);
	}
	res.status(statusCode).send(response);
};