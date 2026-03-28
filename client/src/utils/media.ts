import type { MediaItem } from "@/types/media.types";

export const TMDB = "https://image.tmdb.org/t/p";

export const imgUrl = (
  path?: string | null,
  size: "w92" | "w185" | "w342" | "w500" | "w780" | "w1280" | "original" = "w342"
): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${TMDB}/${size}${path.startsWith("/") ? path : "/" + path}`;
};

export const getTitle = (item: MediaItem): string =>
  item.title || item.name || "Untitled";

export const getYear = (item: MediaItem): string => {
  if (item.year_released) return String(item.year_released);
  const d = item.release_date || item.first_air_date;
  if (d) return String(new Date(d).getFullYear());
  return "N/A";
};

export const getRating = (item: MediaItem): string => {
  const r = item.vote_average;
  if (typeof r === "number" && !isNaN(r) && r > 0) return r.toFixed(1);
  return "N/A";
};

export const getRuntime = (item: MediaItem): string => {
  if (item.runtime) return `${item.runtime}m`;
  if (item.number_of_seasons)
    return `${item.number_of_seasons} Season${item.number_of_seasons > 1 ? "s" : ""}`;
  return "";
};