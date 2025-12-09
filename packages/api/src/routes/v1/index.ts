import { Router } from "express";
import authRoutes from "./auth/routes";
import userRoutes from "./user/routes";
import adminRoutes from "./admin/index";
import publicRoutes from "./public/index";
import marketplaceRoutes from "./marketplace/index";

const router = Router();

const default_routes = [
	{
		path: "/auth",
		routes: authRoutes,
	},
	{
		path: "/user",
		routes: userRoutes,
	},
	{
		path: "/admin",
		routes: adminRoutes,
	},
	{
		path: "/public",
		routes: publicRoutes,
	},
	{
		path: "/marketplace",
		routes: marketplaceRoutes,
	},
];
default_routes.forEach((route) => {
	router.use(route.path, route.routes);
});

export default router;
