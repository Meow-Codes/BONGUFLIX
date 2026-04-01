const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6942";

const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { ...options.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
};

// ─── Types (mirror backend) ───────────────────────────────────────────────────

import type { MediaItem, HomeRow, HomeResponse, SearchResult, Season, Episode } from "@/types/media.types";

// ─── API helpers ──────────────────────────────────────────────────────────────

export const TMDB = "https://image.tmdb.org/t/p";

export const imgUrl = (
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "w780" | "w1280" | "original" = "w342"
): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${TMDB}/${size}${path}`;
  // Your custom poster paths
  return `https://www.themoviedb.org/t/p/${size}/${path}`;
};

export const getTitle = (item: MediaItem) => item.title ?? "[MISSING TITLE]";

export const getYear = (item: MediaItem): string => {
  if (item.year_released) return String(item.year_released);
  const d = item.release_date ?? item.first_air_date;
  if (d) return String(new Date(d).getFullYear());
  return "[MISSING]";
};

export const getRating = (item: MediaItem): string =>
  item.vote_average != null ? item.vote_average.toFixed(1) : "[MISSING]";

export const getRuntime = (item: MediaItem): string => {
  if (item.runtime) return `${item.runtime}m`;
  if (item.number_of_seasons)
    return `${item.number_of_seasons} Season${item.number_of_seasons > 1 ? "s" : ""}`;
  return "[MISSING]";
};

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const fetchUser = (slug: string) =>
  apiFetch<{ username: string; slug: string; randomSeed: number }>(`/api/user/${slug}`);

export const fetchHome = () => apiFetch<HomeResponse>("/api/home");

export const fetchMovieDetail = (id: number) =>
  apiFetch<MediaItem>(`/api/movies/${id}`);

export const fetchTVDetail = (id: number) =>
  apiFetch<MediaItem>(`/api/tv/${id}`);

export const fetchSimilar = (id: number, type: "movie" | "tv") =>
  apiFetch<{ data: MediaItem[] }>(
    type === "movie" ? `/api/movies/${id}/similar` : `/api/tv/${id}/similar`
  );

export const fetchSeasons = (id: number) =>
  apiFetch<{ data: Season[] }>(`/api/tv/${id}/seasons`);

export const fetchEpisodes = (showId: number, season: number) =>
  apiFetch<{ data: Episode[] }>(`/api/tv/${showId}/seasons/${season}/episodes`);

export const fetchSearch = (q: string) =>
  apiFetch<{ query: string; results: SearchResult[] }>(
    `/api/search?q=${encodeURIComponent(q)}`
  );

export const fetchAutocomplete = (q: string) =>
  apiFetch<{ results: SearchResult[] }>(
    `/api/search/autocomplete?q=${encodeURIComponent(q)}`
  );