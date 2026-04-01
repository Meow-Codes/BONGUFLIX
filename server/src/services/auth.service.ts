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
    `INSERT INTO users (username, slug, password_hash, preferences)
     VALUES ($1, $2, $3, '{"onboardingComplete": false}'::jsonb)`,
    [cleanUsername, slug, passwordHash],
  );

  const sessionId = crypto.randomUUID();

  await pool.query(
    `INSERT INTO user_sessions (session_id, username, slug, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
    [sessionId, cleanUsername, slug],
  );

  return {
    success: true,
    slug,
    sessionId,
    isNewUser: true,
    onboardingComplete: false,
  };
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

  const prefRow = await pool.query<{ preferences: { onboardingComplete?: boolean } | null }>(
    "SELECT preferences FROM users WHERE username = $1",
    [cleanUsername],
  );
  const prefs = prefRow.rows[0]?.preferences as Record<string, unknown> | null;
  const onboardingComplete =
    prefs && typeof prefs === "object" && Object.prototype.hasOwnProperty.call(prefs, "onboardingComplete")
      ? prefs.onboardingComplete === true
      : true;

  return { success: true, slug: user.slug, sessionId, isNewUser: false, onboardingComplete };
};

export const logoutUser = async (sessionId: string) => {
  await pool.query("DELETE FROM user_sessions WHERE session_id = $1", [
    sessionId,
  ]);
};

/** Deletes every session row for the same username as the current session (all devices). */
export const logoutAllSessionsForUser = async (sessionId: string) => {
  const { rows } = await pool.query<{ username: string }>(
    "SELECT username FROM user_sessions WHERE session_id = $1 AND expires_at > NOW()",
    [sessionId],
  );
  const row = rows[0];
  if (!row) throw new Error("INVALID_SESSION");
  const { username } = row;
  await pool.query("DELETE FROM user_sessions WHERE username = $1", [username]);
};
