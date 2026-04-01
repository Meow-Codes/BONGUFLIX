import { Request, Response } from "express";
import { registerUser, loginUser, logoutUser } from "../services/auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password are required" });

    const data = await registerUser(username, password);
    res.cookie("sessionId", data.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json(data);
  } catch (err: any) {
    if (err.message === "USERNAME_TAKEN")
      return res.status(409).json({ error: "USERNAME_TAKEN" });
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password are required" });

    const data = await loginUser(username, password);
    res.cookie("sessionId", data.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json(data);
  } catch (err: any) {
    if (err.message === "USER_NOT_FOUND")
      return res.status(404).json({ error: "USERNAME_TAKEN" });
    if (err.message === "INVALID_CREDENTIALS")
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    res.status(400).json({ error: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const sessionId =
    typeof req.headers["x-session-id"] === "string"
      ? req.headers["x-session-id"]
      : req.cookies?.sessionId;
  if (sessionId) await logoutUser(sessionId);
  res.clearCookie("sessionId");
  res.json({ success: true });
};