import { pool } from "../config/db.js";
import { cache, TTL } from "../utils/cache.js";
import {
  attachGenres,
  attachCast,
  attachDirectors,
} from "../utils/mediaHelpers.js";
import {
  buildPaginatedResponse,
  parsePagination,
} from "../utils/pagination.js";
import type { Movie, PaginationParams } from "../types/media.types.js";
import { Request } from "express";

// ─── Base SELECT — used everywhere ────────────────────────────────────────────

const MOVIE_SELECT = `
  m.id, m.tmdb_id, m.imdb_id, m.title, m.original_title,
  m.overview, m.release_date, m.year_released, m.runtime,
  m.original_language, m.popularity, m.vote_average, m.vote_count,
  m.poster_path, m.backdrop_path, m.trailer_url,
  m.imdb_rating, m.rotten_tomatoes, m.metacritic,
  m.age_certification, m.budget, m.revenue
`;

// ─── Enrich a list with genres + directors ────────────────────────────────────

const enrichMovies = async (
  rows: Movie[],
  withCast = false,
): Promise<Movie[]> => {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);

  const [genreMap, directorMap, castMap] = await Promise.all([
    attachGenres(ids, "movie"),
    attachDirectors(ids, "movie"),
    withCast ? attachCast(ids, "movie", 15) : Promise.resolve(new Map()),
  ]);

  return rows.map((m) => ({
    ...m,
    genres: genreMap.get(m.id) ?? [],
    director: directorMap.get(m.id) ?? null,
    cast: withCast ? (castMap.get(m.id) ?? []) : undefined,
  }));
};

// ─── List movies with flexible filters ───────────────────────────────────────

export const getMovies = async (req: Request) => {
  const { page, limit, offset } = parsePagination(req);
  const {
    genre,
    year,
    sort = "popularity",
    order = "desc",
    lang,
    min_rating,
  } = req.query;

  const cacheKey = `movies:list:${JSON.stringify({ page, limit, genre, year, sort, order, lang, min_rating })}`;
  const cached = await cache.get<ReturnType<typeof buildPaginatedResponse>>(cacheKey);
  if (cached) return cached;

  const conditions: string[] = ["m.vote_average IS NOT NULL"];
  const params: unknown[] = [];
  let p = 1;

  if (genre) {
    conditions.push(
      `EXISTS (SELECT 1 FROM movie_genres mg JOIN genres g ON g.id = mg.genre_id WHERE mg.movie_id = m.id AND LOWER(g.name) = LOWER($${p++}))`,
    );
    params.push(genre);
  }
  if (year) {
    conditions.push(`m.year_released = $${p++}`);
    params.push(Number(year));
  }
  if (lang) {
    conditions.push(`m.original_language = $${p++}`);
    params.push(lang);
  }
  if (min_rating) {
    conditions.push(`m.vote_average >= $${p++}`);
    params.push(Number(min_rating));
  }

  const allowedSorts: Record<string, string> = {
    popularity: "m.popularity",
    rating: "m.vote_average",
    year: "m.year_released",
    title: "m.title",
    vote_count: "m.vote_count",
  };
  const sortCol = allowedSorts[sort as string] ?? "m.popularity";
  const sortDir = order === "asc" ? "ASC" : "DESC";
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query<Movie>(
      `SELECT ${MOVIE_SELECT}
       FROM movies m
       ${where}
       ORDER BY ${sortCol} ${sortDir} NULLS LAST
       LIMIT $${p++} OFFSET $${p++}`,
      [...params, limit, offset],
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM movies m ${where}`,
      params,
    ),
  ]);

  const enriched = await enrichMovies(rows);
  const total = parseInt(countRows[0]?.count || "0", 10);
  const result = buildPaginatedResponse(enriched, total, {
    page,
    limit,
    offset,
  });

  await cache.set(cacheKey, result, TTL.LIST);
  return result;
};

// ─── Single movie ─────────────────────────────────────────────────────────────

export const getMovieById = async (id: number): Promise<Movie | null> => {
  const cacheKey = `movie:${id}`;
  const cached = await cache.get<Movie>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Movie>(
    `SELECT ${MOVIE_SELECT} FROM movies m WHERE m.id = $1`,
    [id],
  );
  if (!rows.length) return null;

  const [enriched] = await enrichMovies(rows, true);
  await cache.set(cacheKey, enriched, TTL.DETAIL);
  return enriched || null;
};

// ─── Trending (high popularity + high vote_count) ────────────────────────────

export const getTrendingMovies = async (limit = 20): Promise<Movie[]> => {
  const cacheKey = `movies:trending:${limit}`;
  const cached = await cache.get<Movie[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Movie>(
    `SELECT ${MOVIE_SELECT}
     FROM movies m
     WHERE m.popularity IS NOT NULL
       AND m.vote_count > 50
       AND m.backdrop_path IS NOT NULL
     ORDER BY m.popularity DESC NULLS LAST
     LIMIT $1`,
    [limit],
  );

  const enriched = await enrichMovies(rows);
  await cache.set(cacheKey, enriched, TTL.TRENDING);
  return enriched;
};

// ─── Top rated ────────────────────────────────────────────────────────────────

export const getTopRatedMovies = async (limit = 20): Promise<Movie[]> => {
  const cacheKey = `movies:toprated:${limit}`;
  const cached = await cache.get<Movie[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Movie>(
    `SELECT ${MOVIE_SELECT}
     FROM movies m
     WHERE m.vote_average >= 7.0
       AND m.vote_count > 100
       AND m.poster_path IS NOT NULL
     ORDER BY m.vote_average DESC, m.vote_count DESC
     LIMIT $1`,
    [limit],
  );

  const enriched = await enrichMovies(rows);
  await cache.set(cacheKey, enriched, TTL.TRENDING);
  return enriched;
};

// ─── By genre ─────────────────────────────────────────────────────────────────

export const getMoviesByGenre = async (
  genreName: string,
  limit = 20,
): Promise<Movie[]> => {
  const cacheKey = `movies:genre:${genreName}:${limit}`;
  const cached = await cache.get<Movie[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Movie>(
    `SELECT ${MOVIE_SELECT}
     FROM movies m
     JOIN movie_genres mg ON mg.movie_id = m.id
     JOIN genres g ON g.id = mg.genre_id
     WHERE LOWER(g.name) = LOWER($1)
       AND m.poster_path IS NOT NULL
     ORDER BY m.popularity DESC NULLS LAST
     LIMIT $2`,
    [genreName, limit],
  );

  const enriched = await enrichMovies(rows);
  await cache.set(cacheKey, enriched, TTL.LIST);
  return enriched;
};

// ─── Similar movies (shared genres) ──────────────────────────────────────────

export const getSimilarMovies = async (
  movieId: number,
  limit = 12,
): Promise<Movie[]> => {
  const cacheKey = `movie:${movieId}:similar`;
  const cached = await cache.get<Movie[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Movie>(
    `SELECT ${MOVIE_SELECT},
       COUNT(DISTINCT mg2.genre_id) AS shared_genres
     FROM movies m
     JOIN movie_genres mg2 ON mg2.movie_id = m.id
     WHERE mg2.genre_id IN (
       SELECT genre_id FROM movie_genres WHERE movie_id = $1
     )
     AND m.id <> $1
     AND m.poster_path IS NOT NULL
     GROUP BY m.id
     ORDER BY shared_genres DESC, m.popularity DESC NULLS LAST
     LIMIT $2`,
    [movieId, limit],
  );

  const enriched = await enrichMovies(rows);
  await cache.set(cacheKey, enriched, TTL.DETAIL);
  return enriched;
};

// ─── New releases ─────────────────────────────────────────────────────────────

export const getNewMovies = async (limit = 20): Promise<Movie[]> => {
  const cacheKey = `movies:new:${limit}`;
  const cached = await cache.get<Movie[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Movie>(
    `SELECT ${MOVIE_SELECT}
     FROM movies m
     WHERE m.year_released >= EXTRACT(YEAR FROM NOW()) - 2
       AND m.poster_path IS NOT NULL
     ORDER BY m.release_date DESC NULLS LAST
     LIMIT $1`,
    [limit],
  );

  const enriched = await enrichMovies(rows);
  await cache.set(cacheKey, enriched, TTL.LIST);
  return enriched;
};
