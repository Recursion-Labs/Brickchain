import { v1 } from "@/controllers";
import { authenticate } from "@/middlewares/auth.middleware";
import { imageUpload } from "@/middlewares/multer.middleware";
import { Router } from "express";
import marketPlaceRoutes from "@/routes/v1/user/marketplace/routes";

const router = Router();

router.use(authenticate);
router.get("/@me", v1.user.profileController.getUserByToken);

router.use(marketPlaceRoutes);

// Profile routes
router.post("/profile/avatar", imageUpload.single("image"), v1.user.profileController.uploadProfilePicture);
router.post("/profile/banner", imageUpload.single("image"), v1.user.profileController.uploadBanner);
router.put("/profile", v1.user.profileController.updateProfile);

// Property request routes
router.get("/property-requests", v1.user.propertyRequestController.requestedProperties);
router.get("/property-requests/eligibility", v1.user.propertyRequestController.checkEligibility);
router.post("/property-requests", v1.user.propertyRequestController.requestProperty);
router.delete("/property-requests/:id", v1.user.propertyRequestController.deletePropertyRequest);

router.post(
	"/property/request/image",
	imageUpload.single("image"),
	v1.user.propertyRequestController.uploadRequestImage,
);

export default router;
