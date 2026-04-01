import { pool } from "../config/db.js";
import { cache, TTL } from "../utils/cache.js";
import { attachGenres, attachCast, attachDirectors } from "../utils/mediaHelpers.js";
import { buildPaginatedResponse, parsePagination } from "../utils/pagination.js";
import type { TVShow, Season, Episode, PaginationParams } from "../types/media.types.js";
import { Request } from "express";

// ─── Base SELECT ──────────────────────────────────────────────────────────────

const TV_SELECT = `
  t.id, t.tmdb_id, t.name, t.original_name,
  t.overview, t.first_air_date, t.last_air_date,
  t.number_of_seasons, t.number_of_episodes,
  t.in_production, t.status, t.original_language,
  t.poster_path, t.backdrop_path, t.trailer_url,
  t.vote_average, t.popularity, t.age_certification, t.imdb_rating
`;

// ─── Enrich ───────────────────────────────────────────────────────────────────

const enrichShows = async (rows: TVShow[], withCast = false): Promise<TVShow[]> => {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);

  const [genreMap, creatorMap, castMap] = await Promise.all([
    attachGenres(ids, "tv"),
    attachDirectors(ids, "tv"),
    withCast ? attachCast(ids, "tv", 15) : Promise.resolve(new Map()),
  ]);

  return rows.map((t) => ({
    ...t,
    genres: genreMap.get(t.id) ?? [],
    creator: creatorMap.get(t.id) ?? null,
    cast: withCast ? (castMap.get(t.id) ?? []) : undefined,
  }));
};

// ─── List ─────────────────────────────────────────────────────────────────────

export const getTVShows = async (req: Request) => {
  const { page, limit, offset } = parsePagination(req);
  const { genre, sort = "popularity", order = "desc", status, lang, min_rating } = req.query;

  const cacheKey = `tv:list:${JSON.stringify({ page, limit, genre, sort, order, status, lang, min_rating })}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let p = 1;

  if (genre) {
    conditions.push(
      `EXISTS (SELECT 1 FROM tv_genres tg JOIN genres g ON g.id = tg.genre_id WHERE tg.tv_show_id = t.id AND LOWER(g.name) = LOWER($${p++}))`
    );
    params.push(genre);
  }
  if (status) {
    conditions.push(`LOWER(t.status) = LOWER($${p++})`);
    params.push(status);
  }
  if (lang) {
    conditions.push(`t.original_language = $${p++}`);
    params.push(lang);
  }
  if (min_rating) {
    conditions.push(`t.vote_average >= $${p++}`);
    params.push(Number(min_rating));
  }

  const allowedSorts: Record<string, string> = {
    popularity: "t.popularity",
    rating: "t.vote_average",
    name: "t.name",
    first_air_date: "t.first_air_date",
  };
  const sortCol = allowedSorts[sort as string] ?? "t.popularity";
  const sortDir = order === "asc" ? "ASC" : "DESC";
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query<TVShow>(
      `SELECT ${TV_SELECT} FROM tv_shows t ${where}
       ORDER BY ${sortCol} ${sortDir} NULLS LAST
       LIMIT $${p++} OFFSET $${p++}`,
      [...params, limit, offset]
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM tv_shows t ${where}`,
      params
    ),
  ]);

  const enriched = await enrichShows(rows);
  const total = parseInt(countRows[0]?.count || "0", 10);
  const result = buildPaginatedResponse(enriched, total, { page, limit, offset });
  await cache.set(cacheKey, result, TTL.LIST);
  return result;
};

// ─── Single show ──────────────────────────────────────────────────────────────

export const getTVShowById = async (id: number): Promise<TVShow | null> => {
  const cacheKey = `tv:${id}`;
  const cached = await cache.get<TVShow>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<TVShow>(
    `SELECT ${TV_SELECT} FROM tv_shows t WHERE t.id = $1`,
    [id]
  );
  if (!rows.length) return null;

  const [enriched] = await enrichShows(rows, true);
  await cache.set(cacheKey, enriched, TTL.DETAIL);
  return enriched || null;
};

// ─── Trending ─────────────────────────────────────────────────────────────────

export const getTrendingTV = async (limit = 20): Promise<TVShow[]> => {
  const cacheKey = `tv:trending:${limit}`;
  const cached = await cache.get<TVShow[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<TVShow>(
    `SELECT ${TV_SELECT}
     FROM tv_shows t
     WHERE t.popularity IS NOT NULL
       AND t.backdrop_path IS NOT NULL
     ORDER BY t.popularity DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );

  const enriched = await enrichShows(rows);
  await cache.set(cacheKey, enriched, TTL.TRENDING);
  return enriched;
};

// ─── Top Rated ────────────────────────────────────────────────────────────────

export const getTopRatedTV = async (limit = 20): Promise<TVShow[]> => {
  const cacheKey = `tv:toprated:${limit}`;
  const cached = await cache.get<TVShow[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<TVShow>(
    `SELECT ${TV_SELECT}
     FROM tv_shows t
     WHERE t.vote_average >= 7.0
       AND t.poster_path IS NOT NULL
     ORDER BY t.vote_average DESC, t.popularity DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );

  const enriched = await enrichShows(rows);
  await cache.set(cacheKey, enriched, TTL.TRENDING);
  return enriched;
};

// ─── By genre ─────────────────────────────────────────────────────────────────

export const getTVByGenre = async (genreName: string, limit = 20): Promise<TVShow[]> => {
  const cacheKey = `tv:genre:${genreName}:${limit}`;
  const cached = await cache.get<TVShow[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<TVShow>(
    `SELECT ${TV_SELECT}
     FROM tv_shows t
     JOIN tv_genres tg ON tg.tv_show_id = t.id
     JOIN genres g ON g.id = tg.genre_id
     WHERE LOWER(g.name) = LOWER($1)
       AND t.poster_path IS NOT NULL
     ORDER BY t.popularity DESC NULLS LAST
     LIMIT $2`,
    [genreName, limit]
  );

  const enriched = await enrichShows(rows);
  await cache.set(cacheKey, enriched, TTL.LIST);
  return enriched;
};

// ─── Similar ──────────────────────────────────────────────────────────────────

export const getSimilarTV = async (showId: number, limit = 12): Promise<TVShow[]> => {
  const cacheKey = `tv:${showId}:similar`;
  const cached = await cache.get<TVShow[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<TVShow>(
    `SELECT ${TV_SELECT},
       COUNT(DISTINCT tg2.genre_id) AS shared_genres
     FROM tv_shows t
     JOIN tv_genres tg2 ON tg2.tv_show_id = t.id
     WHERE tg2.genre_id IN (
       SELECT genre_id FROM tv_genres WHERE tv_show_id = $1
     )
     AND t.id <> $1
     AND t.poster_path IS NOT NULL
     GROUP BY t.id
     ORDER BY shared_genres DESC, t.popularity DESC NULLS LAST
     LIMIT $2`,
    [showId, limit]
  );

  const enriched = await enrichShows(rows);
  await cache.set(cacheKey, enriched, TTL.DETAIL);
  return enriched;
};

// ─── Seasons ──────────────────────────────────────────────────────────────────

export const getSeasons = async (showId: number): Promise<Season[]> => {
  const cacheKey = `tv:${showId}:seasons`;
  const cached = await cache.get<Season[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Season>(
    `SELECT id, tv_show_id, season_number, name, overview, poster_path, air_date, episode_count
     FROM seasons
     WHERE tv_show_id = $1
     ORDER BY season_number ASC`,
    [showId]
  );

  await cache.set(cacheKey, rows, TTL.DETAIL);
  return rows;
};

// ─── Episodes for a season ────────────────────────────────────────────────────

export const getEpisodes = async (showId: number, seasonNumber: number): Promise<Episode[]> => {
  const cacheKey = `tv:${showId}:s${seasonNumber}:episodes`;
  const cached = await cache.get<Episode[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Episode>(
    `SELECT e.id, e.tv_show_id, e.season_id, e.episode_number,
            e.title, e.overview, e.runtime, e.air_date, e.still_path, e.vote_average
     FROM episodes e
     JOIN seasons s ON s.id = e.season_id
     WHERE e.tv_show_id = $1
       AND s.season_number = $2
     ORDER BY e.episode_number ASC`,
    [showId, seasonNumber]
  );

  await cache.set(cacheKey, rows, TTL.DETAIL);
  return rows;
};