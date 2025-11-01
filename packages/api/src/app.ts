import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import router from "./routes";
import { errorConverter, errorHandler } from "./handlers/error.handler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(router);

app.use(errorConverter);
app.use(errorHandler);

export default app;
