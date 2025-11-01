import winston from "winston";
import { format, transports } from "winston";
const { combine, timestamp, printf, colorize } = format;
import path from "path";

const loggerFormat = printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

export const logger = winston.createLogger({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), loggerFormat),
	transports: [
		new transports.Console(),
		new transports.File({
			filename: path.join("logs", "combined.log"),
		}),
		new transports.File({
			filename: path.join("logs", "error.log"),
			level: "error",
		}),
	],
});
