import { Request, Response, NextFunction } from "express";
import { pool } from "../config/db.js";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let sessionId = 
    (req.headers["x-session-id"] as string) ||
    (req.query.sessionId as string) ||
    (req.cookies?.sessionId as string);   // ← Added this line

  if (!sessionId) {
    res.status(401).json({ error: "No session provided" });
    return;
  }
  // const rawSessionId = req.headers["x-session-id"] ?? req.query.sessionId;

  // // Normalize: header can be string | string[], query can be string | ParsedQs
  // const sessionId =
  //   typeof rawSessionId === "string" ? rawSessionId : undefined;

  // if (!sessionId) {
  //   res.status(401).json({ error: "No session provided" });
  //   return;
  // }

  try {
    const result = await pool.query(
      "SELECT * FROM user_sessions WHERE session_id = $1 AND expires_at > NOW()",
      [sessionId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    (req as any).user = result.rows[0];
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Server error" });
  }
};