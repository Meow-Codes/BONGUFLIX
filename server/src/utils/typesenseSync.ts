import { typesenseClient } from "../config/typesense.js";
import { MEDIA_COLLECTION } from "../config/typesense.schema.js";

export async function upsertMediaDocument(
  type: "movie" | "tv",
  row: {
    id: number;
    tmdb_id?: number;
    title: string;
    popularity?: number;
    vote_average?: number;
    year?: number;
    poster_path?: string;
  }
): Promise<void> {
  await typesenseClient
    .collections(MEDIA_COLLECTION)
    .documents()
    .upsert({
      id: `${type}_${row.id}`,
      title: row.title,
      type,
      popularity: row.popularity || 0,
      vote_average: row.vote_average || 0,
      year: row.year || 0,
      poster_path: row.poster_path || "",
      tmdb_id: row.tmdb_id || 0,
    });
}

export async function deleteMediaDocument(
  type: "movie" | "tv",
  id: number
): Promise<void> {
  await typesenseClient
    .collections(MEDIA_COLLECTION)
    .documents(`${type}_${id}`)
    .delete();
}