import type { HomeRow } from "../types/media.types.js";

/** Map user-selected genre names (from TMDB genres table) to home row ids */
const GENRE_TO_ROW_IDS: Record<string, string[]> = {
  Action: ["action_movies", "action_tv"],
  Drama: ["drama_movies", "drama_tv"],
  Comedy: ["comedy_movies", "comedy_tv"],
  Crime: ["crime_movies", "crime_tv"],
  Thriller: ["thriller_movies"],
  Horror: ["horror_movies"],
  "Science Fiction": ["scifi_movies"],
  Animation: ["animation_tv"],
  Documentary: ["documentaries"],
  Fantasy: ["scifi_movies"],
  Romance: ["drama_movies", "comedy_movies"],
  Family: ["comedy_movies", "animation_tv"],
  Mystery: ["crime_movies", "thriller_movies"],
  Adventure: ["action_movies", "action_tv"],
  History: ["documentaries", "drama_movies"],
  War: ["drama_movies", "action_movies"],
  Western: ["drama_movies"],
  "TV Movie": ["drama_movies"],
  Music: ["documentaries"],
  "Action & Adventure": ["action_tv", "action_movies"],
};

const TRY_GENRE_FALLBACKS = [
  "Comedy",
  "Documentary",
  "Animation",
  "Crime",
  "Drama",
  "Science Fiction",
];

function rowIdsForGenre(name: string): string[] {
  const direct = GENRE_TO_ROW_IDS[name];
  if (direct?.length) return direct;
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(GENRE_TO_ROW_IDS)) {
    if (k.toLowerCase() === lower) return v;
  }
  return [];
}

/** Dedupe by row id, preserve first occurrence order */
function dedupeRows(rows: HomeRow[]): HomeRow[] {
  const seen = new Set<string>();
  const out: HomeRow[] = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

export type PrefsShape = {
  selections?: string[];
  genres?: string[];
  onboardingComplete?: boolean;
};

/**
 * Pins genre-based rows to the top (after trending blocks) based on onboarding `selections`.
 * Adds an optional "Try this genre too" row using a genre not in selections.
 */
export function personalizeHomeRows(
  rows: HomeRow[],
  prefs: PrefsShape | null | undefined,
): HomeRow[] {
  if (!prefs?.onboardingComplete) return rows;

  const selections = prefs.selections ?? prefs.genres ?? [];
  if (!Array.isArray(selections) || selections.length === 0) return rows;

  const pinnedIds: string[] = [];
  for (const name of selections) {
    for (const id of rowIdsForGenre(name)) {
      if (!pinnedIds.includes(id)) pinnedIds.push(id);
    }
  }

  const byId = new Map(rows.map((r) => [r.id, r]));
  const pinned: HomeRow[] = [];
  for (const id of pinnedIds) {
    const row = byId.get(id);
    if (row && row.items.length >= 4) pinned.push(row);
  }

  const trendingIds = new Set(["trending_movies", "trending_tv"]);
  const head = rows.filter((r) => trendingIds.has(r.id));
  const rest = rows.filter(
    (r) => !trendingIds.has(r.id) && !pinned.some((p) => p.id === r.id),
  );

  const merged = dedupeRows([...head, ...pinned, ...rest]);

  const selectionSet = new Set(selections.map((s) => s.toLowerCase()));
  const tryGenre = TRY_GENRE_FALLBACKS.find(
    (g) => !selectionSet.has(g.toLowerCase()),
  );
  if (!tryGenre) return merged;

  const tryIds = rowIdsForGenre(tryGenre);
  const tryRow = tryIds
    .map((id) => byId.get(id))
    .find((r) => r && r.items.length >= 4) as HomeRow | undefined;
  if (!tryRow) return merged;

  const insertAt = Math.min(2 + pinned.length, merged.length);
  const tryId = `try_genre_${tryGenre.replace(/\s+/g, "_").toLowerCase()}`;
  if (merged.some((r) => r.id === tryId)) return merged;

  return [
    ...merged.slice(0, insertAt),
    {
      ...tryRow,
      id: tryId,
      title: `Try ${tryGenre} too`,
    },
    ...merged.slice(insertAt),
  ];
}
