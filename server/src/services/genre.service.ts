import { pool } from "../config/db.js";
import { cache, TTL } from "../utils/cache.js";
import type { Genre, GenreStats } from "../types/media.types.js";

export const getGenres = async (): Promise<Genre[]> => {
  const cacheKey = "genres:all";
  const cached = cache.get<Genre[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Genre>(
    `SELECT id, name, tmdb_id FROM genres ORDER BY name`
  );

  cache.set(cacheKey, rows, TTL.GENRES);
  return rows;
};

export const getGenreStats = async (): Promise<GenreStats[]> => {
  const cacheKey = "genres:stats";
  const cached = cache.get<GenreStats[]>(cacheKey);
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

  cache.set(cacheKey, rows, TTL.GENRES);
  return rows;
};