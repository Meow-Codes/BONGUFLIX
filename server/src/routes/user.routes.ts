import { Router } from "express";
import { getUser } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.get("/:slug", requireAuth, getUser);

export default router;