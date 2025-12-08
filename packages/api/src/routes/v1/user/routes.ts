import { v1 } from "@/controllers";
import { authenticate } from "@/middlewares/auth.middleware";
import { imageUpload } from "@/middlewares/multer.middleware";
import { Router } from "express";

const router = Router();

router.get("/@me", authenticate, v1.user.profileController.getUserByToken);

// Profile routes
router.post("/profile/avatar", authenticate, imageUpload.single('image'), v1.user.profileController.uploadProfilePicture);
router.post("/profile/banner", authenticate, imageUpload.single('image'), v1.user.profileController.uploadBanner);
router.put("/profile", authenticate, v1.user.profileController.updateProfile);

// Property request routes
router.get("/property-requests", authenticate, v1.user.propertyRequestController.requestedProperties);
router.post("/property-requests", authenticate, v1.user.propertyRequestController.requestProperty);

export default router;
