import { Router } from "express";
import authRoutes from "./auth/routes";

const router = Router();

const default_routes = [
	{
		path: "/auth",
		routes: authRoutes,
	},
];
default_routes.forEach((route) => {
	router.use(route.path, route.routes);
});

export default router;
