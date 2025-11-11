import { Router } from "express";
import propertyRoutes from "./property/routes";

const router = Router();

const admin_routes = [
	{
		path: "/property",
		routes: propertyRoutes,
	},
];

admin_routes.forEach((route) => {
	router.use(route.path, route.routes);
});

export default router;