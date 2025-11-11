import { Router } from "express";
import propertyRoutes from "./property/routes";

const router = Router();

const public_routes = [
	{
		path: "/property",
		routes: propertyRoutes,
	},
];

public_routes.forEach((route) => {
	router.use(route.path, route.routes);
});

export default router;