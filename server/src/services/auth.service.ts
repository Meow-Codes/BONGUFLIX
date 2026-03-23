import crypto from "crypto";
import { pool } from "../config/db.js";
import { generateSlug } from "../utils/slugGenerator.js";

export const loginUser = async (username: string) => {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername) throw new Error("Username required");

  const slug = generateSlug(cleanUsername);

  // Upsert user
  await pool.query(
    `INSERT INTO users (username, slug) 
     VALUES ($1, $2) 
     ON CONFLICT (username) DO UPDATE SET last_active = NOW(), slug = $2`,
    [cleanUsername, slug]
  );

  // Create fresh session
  const sessionId = crypto.randomUUID();
  await pool.query(
    "INSERT INTO user_sessions (session_id, username, slug) VALUES ($1, $2, $3)",
    [sessionId, cleanUsername, slug]
  );

  return {
    success: true,
    slug,
    sessionId,
    redirect: `/dashboard/${slug}`,
  };
};