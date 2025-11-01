import "./config/moduleAlias";
import app from "./app";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	logger.info(`[SERVER] backend is live on http://localhost:${PORT}`);
});