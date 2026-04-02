import { typesenseClient } from "../config/typesense.js";
import { MEDIA_COLLECTION } from "../config/typesense.schema.js";
import { cache, TTL } from "../utils/cache.js";
import type { SearchResult } from "../types/media.types.js";

// ── Types ────────────────────────────────────────────────────────────────────

interface TypesenseHit {
  document: {
    id: string;
    title: string;
    type: "movie" | "tv";
    popularity: number;
    vote_average: number;
    year: number;
    poster_path: string;
    tmdb_id: number;
  };
  highlights?: Array<{
    field: string;
    snippet: string;
    matched_tokens: string[];
  }>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseNumericId(compositeId: string): number {
  // "movie_123" → 123, "tv_456" → 456
  const [, idPart] = compositeId.split("_");
  return parseInt(idPart ?? "0", 10);
}

function hitToSearchResult(hit: TypesenseHit): SearchResult {
  const doc = hit.document;
  return {
    id: parseNumericId(doc.id),
    media_type: doc.type,
    title: doc.title,
    poster_path: doc.poster_path || null,
    year: doc.year || null,
    vote_average: doc.vote_average || null,
    // highlight snippet if your SearchResult type supports it:
    // highlight: hit.highlights?.find(h => h.field === "title")?.snippet,
  };
}

// ── Main search ──────────────────────────────────────────────────────────────

export const search = async (
  query: string,
  limit = 20,
): Promise<SearchResult[]> => {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const cacheKey = `search:ts:${q.toLowerCase()}:${limit}`;

  const cached = await cache.get<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const searchParams = {
    q,
    query_by: "title",
    sort_by: "_text_match:desc,popularity:desc,vote_average:desc",
    per_page: limit,
    // Typo tolerance: allow 1 typo for words 4+ chars, 2 typos for 8+ chars
    num_typos: 2,
    typo_tokens_threshold: 1,
    // Prefix search (enables "dea" → "Death Note")
    prefix: true,
    // Highlight matched text in title
    highlight_full_fields: "title",
    highlight_affix_num_tokens: 4,
    // Only return fields we need — reduces payload
    include_fields: "id,title,type,popularity,vote_average,year,poster_path",
    // Drop very low relevance results
    drop_tokens_threshold: 1,
  };

  const response = await typesenseClient
    .collections(MEDIA_COLLECTION)
    .documents()
    .search(searchParams);

  const results = (response.hits as TypesenseHit[]).map(hitToSearchResult);

  await cache.set(cacheKey, results, TTL.SEARCH);
  return results;
};

// ── Autocomplete (fast prefix-only, top 8, minimal payload) ─────────────────

export const autocomplete = async (
  query: string,
): Promise<
  Pick<SearchResult, "id" | "media_type" | "title" | "year" | "poster_path">[]
> => {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const cacheKey = `autocomplete:ts:${q.toLowerCase()}`;

  const cached = await cache.get<[]>(cacheKey);
  if (cached) return cached;

  const response = await typesenseClient
  .collections(MEDIA_COLLECTION)
  .documents()
  .search({
    q,
    query_by: "title",
    sort_by: "_text_match:desc,popularity:desc",
    per_page: 8,
    prefix: true,
    num_typos: 1,
    include_fields: "id,title,type,year,poster_path",
    exclude_fields: "popularity,vote_average,tmdb_id",
    query_by_weights: "3",
    drop_tokens_threshold: 1,
    filter_by: "popularity:>10",

    min_len_1typo: 4,
    min_len_2typo: 8,
  });

  const results = (response.hits as TypesenseHit[]).map((hit) => ({
    id: parseNumericId(hit.document.id),
    media_type: hit.document.type,
    title: hit.document.title,
    year: hit.document.year || null,
    poster_path: hit.document.poster_path || null,
  }));

  await cache.set(cacheKey, results, TTL.SEARCH);
  return results;
};
