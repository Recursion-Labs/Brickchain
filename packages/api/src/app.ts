import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import router from "./routes";
import session from "express-session";
import { errorConverter, errorHandler } from "./handlers/error.handler";
import passport from "./strategies/google.strategy";
import envVars from "./config/envVars";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
	session({
		secret: envVars.JWT_SECRET,
		resave: false,
		saveUninitialized: false,
	}),
);

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

app.use(passport.initialize());
app.use(passport.session());

app.use(router);
app.use(errorConverter);
app.use(errorHandler);

export default app;
