import { logger } from "@/utils/logger";
import Redis from "ioredis";

class RedisService {
	private client: Redis;

	constructor(
		host: string = process.env.REDIS_HOST || "127.0.0.1",
		port: number = Number(process.env.REDIS_PORT) || 6379,
		db: number = Number(process.env.REDIS_DB) || 0,
	) {
		this.client = new Redis({
			host: host,
			port: port,
			db: db,
		});

		this.client.on("connect", () => {
			logger.info("[ REDIS ] Connected to Redis.");
		});

		this.client.on("error", (err: any) => {
			logger.error("[ REDIS ] Failed to connect to Redis.", err);
		});
	}

	async setValue(key: string, value: string, expiry?: number): Promise<boolean> {
		try {
			if (expiry) {
				await this.client.set(key, value, "EX", expiry);
			} else {
				await this.client.set(key, value);
			}
			return true;
		} catch (error) {
			logger.error(`[REDIS] Error setting value for key ${key}: ${error}`);
			return false;
		}
	}

	async getValue(key: string): Promise<string | null> {
		try {
			const value = await this.client.get(key);
			if (value != null) {
				return value;
			} else {
				logger.warn(`[REDIS] Key ${key} not found.`);
				return null;
			}
		} catch (error) {
			logger.error(`[REDIS] Error getting value for key ${key}: ${error}`);
			return null;
		}
	}

	async updateValue(key: string, value: string): Promise<boolean> {
		try {
			const exists = await this.client.exists(key);
			if (exists) {
				await this.setValue(key, value);
				return true;
			} else {
				logger.warn(`[REDIS] Key ${key} not found for update.`);
				return false;
			}
		} catch (error) {
			logger.error(`[REDIS] Unexpected error updating value for key ${key}: ${error}`);
			return false;
		}
	}

	async deleteValue(key: string): Promise<boolean> {
		try {
			const result = await this.client.del(key);
			if (result > 0) {
				return true;
			} else {
				logger.warn(`[REDIS] Key ${key} not found for deletion.`);
				return false;
			}
		} catch (error) {
			logger.error(`[REDIS] Error deleting key ${key}: ${error}`);
			return false;
		}
	}
}

export default RedisService;
