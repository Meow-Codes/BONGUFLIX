const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6942";

const getSession = () =>
  typeof window !== "undefined" ? localStorage.getItem("sessionId") ?? "" : "";

const apiFetch = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${API}${path}`, {
    headers: { "X-Session-Id": getSession() },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
};

// ─── Types (mirror backend) ───────────────────────────────────────────────────

export type MediaItem = {
  id: number;
  tmdb_id: number | null;
  title: string;
  overview: string | null;
  release_date: string | null;
  year_released: number | null;
  runtime: number | null;
  popularity: number | null;
  vote_average: number | null;
  vote_count: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  trailer_url: string | null;
  age_certification: string | null;
  imdb_rating: number | null;
  media_type: "movie" | "tv";
  genres?: string[];
  cast?: CastMember[];
  director?: string | null;
  creator?: string | null;
  // TV-only
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  status?: string | null;
  first_air_date?: string | null;
};

export type CastMember = {
  person_id: number;
  name: string;
  character_name: string | null;
  profile_path: string | null;
  order_number: number | null;
};

export type HomeRow = {
  id: string;
  title: string;
  type: "movie" | "tv" | "mixed";
  items: MediaItem[];
};

export type HomeResponse = {
  hero: MediaItem | null;
  rows: HomeRow[];
};

export type SearchResult = {
  id: number;
  media_type: "movie" | "tv" | "person";
  title: string;
  poster_path: string | null;
  year: number | null;
  vote_average: number | null;
  overview: string | null;
};

export type Season = {
  id: number;
  tv_show_id: number;
  season_number: number;
  name: string | null;
  overview: string | null;
  poster_path: string | null;
  air_date: string | null;
  episode_count: number | null;
};

export type Episode = {
  id: number;
  episode_number: number;
  title: string;
  overview: string | null;
  runtime: number | null;
  air_date: string | null;
  still_path: string | null;
  vote_average: number | null;
};

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