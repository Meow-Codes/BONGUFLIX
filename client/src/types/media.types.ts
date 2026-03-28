export interface MediaBase {
  id: number;
  tmdb_id?: number;
  title: string;
  overview?: string;
  release_date?: string;
  year_released?: number;
  runtime?: number;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string;
  backdrop_path?: string;
  trailer_url?: string;
  age_certification?: string;
  imdb_rating?: number;
  media_type: "movie" | "tv";
}

export interface Movie extends MediaBase {
  media_type: "movie";
  original_title?: string;
  original_language?: string;
  imdb_id?: string;
  rotten_tomatoes?: number;
  metacritic?: number;
  budget?: number;
  revenue?: number;
  genres?: string[];
  director?: string | null;
  cast?: Array<{
    person_id: number;
    name: string;
    character_name?: string | null;
    profile_path?: string | null;
    order_number?: number | null;
  }>;
}

export interface TVShow extends MediaBase {
  media_type: "tv";
  original_name?: string;
  first_air_date?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  in_production?: boolean;
  status?: string;
  original_language?: string;
  genres?: string[];
  creator?: string | null;
  cast?: Array<{
    person_id: number;
    name: string;
    character_name?: string | null;
    profile_path?: string | null;
    order_number?: number | null;
  }>;
}

export interface Season {
  id: number;
  tv_show_id: number;
  season_number: number;
  name?: string;
  overview?: string;
  poster_path?: string;
  air_date?: string;
  episode_count?: number;
}

export interface Episode {
  id: number;
  tv_show_id: number;
  season_id: number;
  episode_number: number;
  title: string;
  overview?: string;
  runtime?: number;
  air_date?: string;
  still_path?: string;
  vote_average?: number;
}

export interface Person {
  id: number;
  tmdb_id?: number;
  imdb_id?: string;
  name: string;
  biography?: string;
  profile_path?: string;
  known_for_department?: string;
  birthday?: string;
  deathday?: string;
  popularity?: number;
  credits?: Array<{
    id: number;
    media_type: "movie" | "tv";
    media_id: number;
    media_title: string;
    role: string;
    character_name?: string;
    order_number?: number;
    poster_path?: string;
  }>;
}

export interface HomeRow {
  id: string;
  title: string;
  type: "movie" | "tv";
  items: MediaItem[];
}

export interface HomeResponse {
  hero: MediaItem | null;
  rows: HomeRow[];
}

export interface MediaItem extends MediaBase {
  genres?: string[];
}

export interface SearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title: string;
  poster_path?: string;
  year?: number | null;
  vote_average?: number;
  overview?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface Genre {
  id: number;
  name: string;
  tmdb_id?: number;
}

export interface GenreStats {
  genre: string;
  movie_count: number;
  tv_count: number;
}