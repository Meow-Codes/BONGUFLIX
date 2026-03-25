import { pool } from "../config/db.js";

export const getUserBySlug = async (slug: string) => {
  const { rows } = await pool.query(
    "SELECT u.*, s.session_id FROM users u JOIN user_sessions s ON u.slug = s.slug WHERE u.slug = $1 AND s.expires_at > NOW()",
    [slug]
  );

  if (rows.length === 0) throw new Error("User not found or session expired");

  // Simple random seed from slug for frontend randomizer
  const seed = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  return {
    username: rows[0].username,
    slug,
    // sessionId: rows[0].session_id,
    lastActive: rows[0].last_active,
    preferences: rows[0].preferences,
    randomSeed: seed,
  };
};