import { pool } from "../config/db.js";
import { cache, TTL } from "../utils/cache.js";
import type { Person } from "../types/media.types.js";

export const getPopularPeople = async (limit = 20): Promise<Person[]> => {
  const cacheKey = `people:popular:${limit}`;
  const cached = await cache.get<Person[]>(cacheKey);
  if (cached) return cached;

  const { rows } = await pool.query<Person>(
    `SELECT id, tmdb_id, name, profile_path, known_for_department, popularity
     FROM people 
     WHERE popularity IS NOT NULL
     ORDER BY popularity DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );

  await cache.set(cacheKey, rows, TTL.PERSON);
  return rows;
};

export const getPersonById = async (id: number) => {
  const cacheKey = `person:${id}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const { rows: personRows } = await pool.query(
    `SELECT * FROM people WHERE id = $1`,
    [id]
  );
  if (!personRows.length) return null;

  const person = personRows[0];

  const { rows: credits } = await pool.query(
    `SELECT 
       c.id, c.media_type, c.media_id, c.role, c.character_name, c.order_number,
       CASE WHEN c.media_type = 'movie' THEN m.title ELSE t.name END AS media_title,
       CASE WHEN c.media_type = 'movie' THEN m.poster_path ELSE t.poster_path END AS poster_path
     FROM credits c
     LEFT JOIN movies m ON c.media_type = 'movie' AND c.media_id = m.id
     LEFT JOIN tv_shows t ON c.media_type = 'tv' AND c.media_id = t.id
     WHERE c.person_id = $1
     ORDER BY c.order_number NULLS LAST, c.media_type`,
    [id]
  );

  const result = { ...person, credits };
  await cache.set(cacheKey, result, TTL.PERSON);
  return result;
};