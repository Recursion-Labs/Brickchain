import { Router } from "express";
import authRoutes from "./auth/routes";
import publicRoutes from "./public/routes";

const router = Router();

const default_routes = [
	{
		path: "/auth",
		routes: authRoutes,
	},
	{
		path: "/public",
		routes: publicRoutes,
	},
	{
		path: "/pdf",
		routes: require("./pdf/routes").default,
	},
];
default_routes.forEach((route) => {
	router.use(route.path, route.routes);
});

export default router;
