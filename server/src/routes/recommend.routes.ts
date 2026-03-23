import { Router } from "express";
import { recommend } from "../controllers/recommend.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router: Router = Router();

router.post("/", requireAuth, recommend);

export default router;