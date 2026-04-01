import { Router } from "express";
import multer from "multer";
import {
  getUser,
  getOnboardingOptions,
  postOnboarding,
  patchPreferences,
  postFlushPreferences,
  postUploadAvatar,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireMatchingSlug } from "../middleware/slug.middleware.js";

const router: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.get("/:slug/onboarding-options", requireAuth, requireMatchingSlug, getOnboardingOptions);
router.post("/:slug/onboarding", requireAuth, requireMatchingSlug, postOnboarding);
router.patch("/:slug/preferences", requireAuth, requireMatchingSlug, patchPreferences);
router.post("/:slug/preferences/flush", requireAuth, requireMatchingSlug, postFlushPreferences);
router.post(
  "/:slug/upload-avatar",
  requireAuth,
  requireMatchingSlug,
  upload.single("file"),
  postUploadAvatar,
);

router.get("/:slug", requireAuth, getUser);

export default router;