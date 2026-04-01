import { pool } from "../config/db.js";
import { cache, TTL } from "../utils/cache.js";
import type { Genre, GenreStats } from "../types/media.types.js";
import { ONBOARDING_INTEREST_KEYWORDS } from "../data/onboardingKeywords.js";

/** Genres safe for onboarding picker (TMDB list has no explicit adult genre) */
const BLOCKED_GENRE = /adult|xxx|porn|erotic/i;

export const getGenres = async (): Promise<Genre[]> => {
  const cacheKey = "genres:all";
  const cached = await cache.get<Genre[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Genre>(
    `SELECT id, name, tmdb_id FROM genres ORDER BY name`
  );

  await cache.set(cacheKey, rows, TTL.GENRES);
  return rows;
};

export const getOnboardingGenreNames = async (): Promise<string[]> => {
  const all = await getGenres();
  return all
    .map((g) => g.name)
    .filter((name) => name && !BLOCKED_GENRE.test(name));
};

export const getOnboardingInterestKeywords = (): string[] => [
  ...ONBOARDING_INTEREST_KEYWORDS,
];

export const getGenreStats = async (): Promise<GenreStats[]> => {
  const cacheKey = "genres:stats";
  const cached = await cache.get<GenreStats[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<GenreStats>(
    `SELECT 
       g.name AS genre,
       COUNT(DISTINCT mg.movie_id) AS movie_count,
       COUNT(DISTINCT tg.tv_show_id) AS tv_count
     FROM genres g
     LEFT JOIN movie_genres mg ON mg.genre_id = g.id
     LEFT JOIN tv_genres tg ON tg.genre_id = g.id
     GROUP BY g.name
     ORDER BY (movie_count + tv_count) DESC`
  );

  await cache.set(cacheKey, rows, TTL.GENRES);
  return rows;
};