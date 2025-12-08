import { Router } from "express";
import propertyRoutes from "./property/routes";
import ipfsRoutes from "./ipfs/routes";

const router = Router();

const admin_routes = [
	{
		path: "/property",
		routes: propertyRoutes,
	},
	{
		path: "/documents",
		routes: ipfsRoutes,
	},
];

admin_routes.forEach((route) => {
	router.use(route.path, route.routes);
});

export default router;