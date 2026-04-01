import { Router } from "express";
import { login, register, logout, logoutAllSessions, me } from "../controllers/auth.controller.js";

const router: Router = Router();

router.get("/me", me);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/logout-all", logoutAllSessions);

export default router;