import "dotenv/config";
console.log("ENV CHECK:", process.env.DATABASE_URL);
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Render Postgres
});

export const initDB = async (): Promise<void> => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      last_active TIMESTAMP DEFAULT NOW(),
      preferences JSONB DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      session_id TEXT PRIMARY KEY,
      username TEXT REFERENCES users(username) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};