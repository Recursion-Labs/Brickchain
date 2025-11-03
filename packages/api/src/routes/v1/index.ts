import { Router } from "express";
import authRoutes from "./auth/routes";
import publicRoutes from "./public/routes";
import userRoutes from "./user/routes"

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
	{
		path: "/user",
		routes: userRoutes
	}
];
default_routes.forEach((route) => {
	router.use(route.path, route.routes);
});

export default router;
