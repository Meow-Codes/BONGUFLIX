import { Request, Response } from "express";
import { pool } from "../config/db.js";
import { registerUser, loginUser, logoutUser, logoutAllSessionsForUser } from "../services/auth.service.js";

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

/** End every session for this account (all devices). Clears current cookie. */
export const logoutAllSessions = async (req: Request, res: Response) => {
  const sessionId =
    typeof req.headers["x-session-id"] === "string"
      ? req.headers["x-session-id"]
      : req.cookies?.sessionId;
  if (!sessionId) {
    res.status(401).json({ error: "No session" });
    return;
  }
  try {
    await logoutAllSessionsForUser(sessionId);
    res.clearCookie("sessionId");
    res.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "INVALID_SESSION") {
      res.status(401).json({ error: "Invalid session" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/** Current session — for landing-page redirect when already logged in */
export const me = async (req: Request, res: Response) => {
  const sessionId =
    typeof req.headers["x-session-id"] === "string"
      ? req.headers["x-session-id"]
      : req.cookies?.sessionId;
  if (!sessionId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const { rows } = await pool.query<{
      slug: string;
      username: string;
      preferences: unknown;
      profile_pic: string | null;
    }>(
      `SELECT u.slug, u.username, u.preferences, u.profile_pic
       FROM users u
       JOIN user_sessions s ON u.slug = s.slug
       WHERE s.session_id = $1 AND s.expires_at > NOW()`,
      [sessionId],
    );
    if (rows.length === 0) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
};