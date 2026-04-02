import "dotenv/config";
import { pool } from "../config/db.js";
import { typesenseClient } from "../config/typesense.js";
import { MEDIA_COLLECTION } from "../config/typesense.schema.js";

const BATCH_SIZE = 500;

interface MediaDocument {
  id: string;
  title: string;
  type: "movie" | "tv";
  popularity: number;
  vote_average: number;
  year: number;
  poster_path: string;
  tmdb_id: number;
}

// 🔥 Batch fetch movies using cursor (NO OFFSET, NO SORT EXPLOSION)
async function* fetchMoviesBatched(): AsyncGenerator<MediaDocument[]> {
  let lastId = 0;

  while (true) {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        tmdb_id,
        title,
        popularity,
        vote_average,
        year_released AS year,
        poster_path
      FROM movies
      WHERE id > $1 AND title IS NOT NULL
      ORDER BY id
      LIMIT $2
      `,
      [lastId, BATCH_SIZE]
    );

    if (rows.length === 0) break;

    lastId = rows[rows.length - 1].id;

    yield rows.map((r) => ({
      id: `movie_${r.id}`,
      title: r.title,
      type: "movie" as const,
      popularity: parseFloat(r.popularity) || 0,
      vote_average: parseFloat(r.vote_average) || 0,
      year: r.year || 0,
      poster_path: r.poster_path || "",
      tmdb_id: r.tmdb_id || 0,
    }));
  }
}

// 🔥 Batch fetch TV shows
async function* fetchTvShowsBatched(): AsyncGenerator<MediaDocument[]> {
  let lastId = 0;

  while (true) {
    const { rows } = await pool.query(
      `
      SELECT
        id,
        tmdb_id,
        name AS title,
        popularity,
        vote_average,
        EXTRACT(YEAR FROM first_air_date)::integer AS year,
        poster_path
      FROM tv_shows
      WHERE id > $1 AND name IS NOT NULL
      ORDER BY id
      LIMIT $2
      `,
      [lastId, BATCH_SIZE]
    );

    if (rows.length === 0) break;

    lastId = rows[rows.length - 1].id;

    yield rows.map((r) => ({
      id: `tv_${r.id}`,
      title: r.title,
      type: "tv" as const,
      popularity: parseFloat(r.popularity) || 0,
      vote_average: parseFloat(r.vote_average) || 0,
      year: r.year || 0,
      poster_path: r.poster_path || "",
      tmdb_id: r.tmdb_id || 0,
    }));
  }
}

// 🔥 Import directly (no slicing needed now)
async function importBatch(batch: MediaDocument[], label: string) {
  const results = await typesenseClient
    .collections(MEDIA_COLLECTION)
    .documents()
    .import(batch, { action: "upsert" });

  const failed = results.filter((r) => !r.success);

  if (failed.length > 0) {
    console.warn(`${label}: ${failed.length} failures`, failed.slice(0, 3));
  } else {
    console.log(`${label}: imported ${batch.length} docs ✓`);
  }
}

async function main() {
  console.time("sync");

  let total = 0;
  let batchNum = 1;

  console.log("🔄 Syncing movies...");

  for await (const batch of fetchMoviesBatched()) {
    await importBatch(batch, `Movies batch ${batchNum++}`);
    total += batch.length;
    console.log(`Total synced: ${total}`);
  }

  console.log("📺 Syncing TV shows...");

  batchNum = 1;

  for await (const batch of fetchTvShowsBatched()) {
    await importBatch(batch, `TV batch ${batchNum++}`);
    total += batch.length;
    console.log(`Total synced: ${total}`);
  }

  const collection = await typesenseClient.collections(MEDIA_COLLECTION).retrieve();
  console.log(`✅ Collection now has ${collection.num_documents} documents`);

  console.timeEnd("sync");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});