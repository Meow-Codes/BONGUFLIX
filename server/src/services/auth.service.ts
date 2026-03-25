import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { generateSlug } from "../utils/slugGenerator.js";

export const registerUser = async (username: string, password: string) => {
  const cleanUsername = username.trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Check if username exists
  const existing = await pool.query(
    "SELECT username FROM users WHERE username = $1",
    [cleanUsername],
  );
  if (existing.rows.length > 0) {
    throw new Error("USERNAME_TAKEN");
  }

  const slug = generateSlug(cleanUsername);
  const passwordHash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO users (username, slug, password_hash)
     VALUES ($1, $2, $3)`,
    [cleanUsername, slug, passwordHash],
  );

  const sessionId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO user_sessions (session_id, username, slug, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
    [sessionId, cleanUsername, slug],
  );

  return { success: true, slug, sessionId };
};

export const loginUser = async (username: string, password: string) => {
  const cleanUsername = username.trim().toLowerCase();

  const result = await pool.query(
    "SELECT username, password_hash, slug FROM users WHERE username = $1",
    [cleanUsername],
  );

  if (result.rows.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  const user = result.rows[0];

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await pool.query("UPDATE users SET last_active = NOW() WHERE username = $1", [
    cleanUsername,
  ]);

  // cleanup old sessions
  await pool.query(
    "DELETE FROM user_sessions WHERE username = $1 AND expires_at < NOW()",
    [cleanUsername],
  );

  const sessionId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO user_sessions (session_id, username, slug, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
    [sessionId, cleanUsername, user.slug],
  );

  return { success: true, slug: user.slug, sessionId };
};

export const logoutUser = async (sessionId: string) => {
  await pool.query("DELETE FROM user_sessions WHERE session_id = $1", [
    sessionId,
  ]);
};
