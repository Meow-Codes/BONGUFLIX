import { pool } from "../config/db.js";
import { cache, TTL } from "../utils/cache.js";
import type { SearchResult } from "../types/media.types.js";

export const search = async (
  query: string,
  limit = 20
): Promise<SearchResult[]> => {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const cacheKey = `search:${q.toLowerCase()}:${limit}`;
  const cached = cache.get<SearchResult[]>(cacheKey);
  if (cached) return cached;

  // Use pg_trgm similarity for fuzzy matching — indexed on title/name columns
  const { rows } = await pool.query<SearchResult>(
    `(
      SELECT
        m.id,
        'movie'              AS media_type,
        m.title              AS title,
        m.poster_path,
        m.year_released      AS year,
        m.vote_average,
        m.overview,
        similarity(m.title, $1) AS sim
      FROM movies m
      WHERE m.title % $1
         OR m.title ILIKE $2
      ORDER BY sim DESC, m.popularity DESC NULLS LAST
      LIMIT $3
    )
    UNION ALL
    (
      SELECT
        t.id,
        'tv'                 AS media_type,
        t.name               AS title,
        t.poster_path,
        EXTRACT(YEAR FROM t.first_air_date)::integer AS year,
        t.vote_average,
        t.overview,
        similarity(t.name, $1) AS sim
      FROM tv_shows t
      WHERE t.name % $1
         OR t.name ILIKE $2
      ORDER BY sim DESC, t.popularity DESC NULLS LAST
      LIMIT $3
    )
    UNION ALL
    (
      SELECT
        p.id,
        'person'             AS media_type,
        p.name               AS title,
        p.profile_path       AS poster_path,
        NULL                 AS year,
        NULL                 AS vote_average,
        p.biography          AS overview,
        similarity(p.name, $1) AS sim
      FROM people p
      WHERE p.name % $1
         OR p.name ILIKE $2
      ORDER BY sim DESC, p.popularity DESC NULLS LAST
      LIMIT 5
    )
    ORDER BY sim DESC
    LIMIT $3`,
    [q, `%${q}%`, limit]
  );

  cache.set(cacheKey, rows, TTL.SEARCH);
  return rows;
};

// ─── Autocomplete (fast, title-only, top 8) ───────────────────────────────────

export const autocomplete = async (query: string): Promise<{ id: number; media_type: string; title: string; year: number | null; poster_path: string | null }[]> => {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const cacheKey = `autocomplete:${q.toLowerCase()}`;
  const cached = cache.get<[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query(
    `(SELECT m.id, 'movie' AS media_type, m.title, m.year_released AS year, m.poster_path
      FROM movies m WHERE m.title ILIKE $1 ORDER BY m.popularity DESC LIMIT 5)
     UNION ALL
     (SELECT t.id, 'tv' AS media_type, t.name AS title,
             EXTRACT(YEAR FROM t.first_air_date)::integer AS year, t.poster_path
      FROM tv_shows t WHERE t.name ILIKE $1 ORDER BY t.popularity DESC LIMIT 5)
     ORDER BY title LIMIT 8`,
    [`${q}%`]
  );

  cache.set(cacheKey, rows, TTL.SEARCH);
  return rows;
};