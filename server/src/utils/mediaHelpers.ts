import { pool } from "../config/db.js";

/**
 * Attach genre names to an array of movie or tv rows.
 * Single query using unnest — far faster than N individual queries.
 */
export const attachGenres = async (
  ids: number[],
  mediaType: "movie" | "tv"
): Promise<Map<number, string[]>> => {
  if (!ids.length) return new Map();

  const table = mediaType === "movie" ? "movie_genres" : "tv_genres";
  const idCol = mediaType === "movie" ? "movie_id" : "tv_show_id";

  const { rows } = await pool.query<{ media_id: number; name: string }>(
    `SELECT mg.${idCol} AS media_id, g.name
     FROM ${table} mg
     JOIN genres g ON g.id = mg.genre_id
     WHERE mg.${idCol} = ANY($1::bigint[])
     ORDER BY mg.${idCol}, g.name`,
    [ids]
  );

  const map = new Map<number, string[]>();
  for (const row of rows) {
    const arr = map.get(row.media_id) ?? [];
    arr.push(row.name);
    map.set(row.media_id, arr);
  }
  return map;
};

/**
 * Attach top-N cast members to a list of media items.
 */
export const attachCast = async (
  ids: number[],
  mediaType: "movie" | "tv",
  limit = 10
): Promise<Map<number, { person_id: number; name: string; character_name: string | null; profile_path: string | null; order_number: number | null }[]>> => {
  if (!ids.length) return new Map();

  const { rows } = await pool.query(
    `SELECT c.media_id, c.person_id, p.name, c.character_name, p.profile_path, c.order_number
     FROM credits c
     JOIN people p ON p.id = c.person_id
     WHERE c.media_type = $1
       AND c.media_id = ANY($2::bigint[])
       AND c.role = 'Actor'
     ORDER BY c.media_id, c.order_number NULLS LAST
     LIMIT $3`,
    [mediaType, ids, ids.length * limit]
  );

  const map = new Map<number, typeof rows>();
  for (const row of rows) {
    const arr = map.get(row.media_id) ?? [];
    if (arr.length < limit) {
      arr.push(row);
      map.set(row.media_id, arr);
    }
  }
  return map;
};

/**
 * Get the primary director/creator for a list of media IDs.
 */
export const attachDirectors = async (
  ids: number[],
  mediaType: "movie" | "tv"
): Promise<Map<number, string>> => {
  if (!ids.length) return new Map();

  const role = mediaType === "movie" ? "Director" : "Creator";

  const { rows } = await pool.query(
    `SELECT DISTINCT ON (c.media_id) c.media_id, p.name
     FROM credits c
     JOIN people p ON p.id = c.person_id
     WHERE c.media_type = $1
       AND c.media_id = ANY($2::bigint[])
       AND c.role = $3
     ORDER BY c.media_id, c.order_number NULLS LAST`,
    [mediaType, ids, role]
  );

  return new Map(rows.map((r) => [r.media_id, r.name]));
};