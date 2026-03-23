import { Request, Response } from "express";
import { pool } from "../config/db.js";

export const recommend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movie } = req.body;

    if (!movie || typeof movie !== "string") {
      res.status(400).json({ error: "movie is required" });
      return;
    }

    const username = (req as any).user?.username;
    if (!username) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Placeholder: swap in your real rec engine here
    const fakeRecs = [
      "Dune: Part Two",
      "Oppenheimer",
      "Interstellar",
      "The Batman",
      "Everything Everywhere All at Once",
      "Parasite",
      "Joker",
      "Spider-Man: Across the Spider-Verse",
      "The Matrix",
      "Inception",
    ];

    await pool.query(
      `UPDATE users
       SET preferences = preferences || jsonb_build_object('lastQuery', $1::text, 'recs', $2::jsonb)
       WHERE username = $3`,
      [movie, JSON.stringify(fakeRecs), username]
    );

    res.json({ input: movie, recommendations: fakeRecs });
  } catch (err) {
    console.error("Recommend error:", err);
    res.status(500).json({ error: "Recommendation failed" });
  }
};