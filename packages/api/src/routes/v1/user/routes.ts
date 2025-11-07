import { v1 } from "@/controllers";
import { authenticate } from "@/middlewares/auth.middleware";
import { imageUpload } from "@/middlewares/multer.middleware";
import { Router } from "express";

const router = Router();

router.get("/@me", authenticate, v1.user.profileController.getUserByToken);
router.post("/profile-picture", authenticate, imageUpload.single('image'), v1.user.profileController.uploadProfilePicture);
router.post("/banner", authenticate, imageUpload.single('image'), v1.user.profileController.uploadBanner);

export default router;
