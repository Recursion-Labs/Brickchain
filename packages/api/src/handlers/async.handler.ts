import type { Request, Response, NextFunction } from "express";
import type qs from "qs";

export interface CustomParamsDictionary {
	[key: string]: any;
}

const catchAsync = <
	P = CustomParamsDictionary,
	ResBody = any,
	ReqBody = any,
	ReqQuery = qs.ParsedQs,
	Locals extends Record<string, any> = Record<string, any>,
>(
	fn: (
		req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
		res: Response<ResBody, Locals>,
		next: NextFunction,
	) => Promise<void>,
) => {
	return (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

export default catchAsync;