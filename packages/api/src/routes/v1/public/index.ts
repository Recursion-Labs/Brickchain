import { Router } from "express";
import propertyRoutes from "./property/routes";
import marketplaceRoutes from "./marketplace/routes";

const router = Router();

const public_routes = [
	{
		path: "/property",
		routes: propertyRoutes,
	},
	{
		path: "/marketplace",
		routes: marketplaceRoutes,
	},
];

public_routes.forEach((route) => {
	router.use(route.path, route.routes);
});

export default router;
