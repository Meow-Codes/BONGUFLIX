import { pool } from "../config/db.js";
import { cache, TTL } from "../utils/cache.js";
import { attachGenres } from "../utils/mediaHelpers.js";
import type { HomeResponse, HomeRow, MediaItem } from "../types/media.types.js";

const MOVIE_COLS = `
  m.id, m.tmdb_id, m.title AS title, m.overview, m.release_date,
  m.year_released, m.runtime, m.popularity, m.vote_average, m.vote_count,
  m.poster_path, m.backdrop_path, m.trailer_url, m.age_certification,
  m.imdb_rating, 'movie' AS media_type
`;

const TV_COLS = `
  t.id, t.tmdb_id, t.name AS title, t.overview, t.first_air_date AS release_date,
  NULL::integer AS year_released, NULL::integer AS runtime,
  t.popularity, t.vote_average, NULL::integer AS vote_count,
  t.poster_path, t.backdrop_path, t.trailer_url, t.age_certification,
  t.imdb_rating, 'tv' AS media_type
`;

// ─── Fetch a genre row (movies OR tv) ─────────────────────────────────────────

const fetchGenreRow = async (
  genreName: string,
  mediaType: "movie" | "tv",
  limit = 20,
): Promise<MediaItem[]> => {
  if (mediaType === "movie") {
    const { rows } = await pool.query(
      `SELECT ${MOVIE_COLS}
       FROM movies m
       JOIN movie_genres mg ON mg.movie_id = m.id
       JOIN genres g ON g.id = mg.genre_id
       WHERE LOWER(g.name) = LOWER($1) AND m.poster_path IS NOT NULL
       ORDER BY m.popularity DESC NULLS LAST
       LIMIT $2`,
      [genreName, limit],
    );
    return rows;
  } else {
    const { rows } = await pool.query(
      `SELECT ${TV_COLS}
       FROM tv_shows t
       JOIN tv_genres tg ON tg.tv_show_id = t.id
       JOIN genres g ON g.id = tg.genre_id
       WHERE LOWER(g.name) = LOWER($1) AND t.poster_path IS NOT NULL
       ORDER BY t.popularity DESC NULLS LAST
       LIMIT $2`,
      [genreName, limit],
    );
    return rows;
  }
};

// ─── Build all rows in parallel ───────────────────────────────────────────────

export const getHomeData = async (): Promise<HomeResponse> => {
  const cacheKey = "home:v1";
  const cached = cache.get<HomeResponse>(cacheKey);
  if (cached) return cached;

  // Run all queries in parallel — this is the key to zero latency
  const [
    trendingMovies,
    trendingTV,
    topRatedMovies,
    topRatedTV,
    newMovies,
    actionMovies,
    dramaMovies,
    comedyMovies,
    crimeMovies,
    thrillerMovies,
    scifiMovies,
    horrorMovies,
    actionTV,
    dramaTV,
    comedyTV,
    crimeTV,
    animationTV,
    documentaries,
  ] = await Promise.all([
    // Trending Movies
    pool.query(
      `SELECT ${MOVIE_COLS} FROM movies m
       WHERE m.popularity IS NOT NULL AND m.backdrop_path IS NOT NULL AND m.vote_count > 50
       ORDER BY m.popularity DESC NULLS LAST LIMIT 25`,
    ),
    // Trending TV
    pool.query(
      `SELECT ${TV_COLS} FROM tv_shows t
       WHERE t.popularity IS NOT NULL AND t.backdrop_path IS NOT NULL
       ORDER BY t.popularity DESC NULLS LAST LIMIT 25`,
    ),
    // Top Rated Movies
    pool.query(
      `SELECT ${MOVIE_COLS} FROM movies m
       WHERE m.vote_average >= 7.5 AND m.vote_count > 200 AND m.poster_path IS NOT NULL
       ORDER BY m.vote_average DESC, m.vote_count DESC LIMIT 25`,
    ),
    // Top Rated TV
    pool.query(
      `SELECT ${TV_COLS} FROM tv_shows t
       WHERE t.vote_average >= 7.5 AND t.poster_path IS NOT NULL
       ORDER BY t.vote_average DESC, t.popularity DESC LIMIT 25`,
    ),
    // New on BONGUFLIX (last 2 years)
    pool.query(
      `SELECT ${MOVIE_COLS} FROM movies m
       WHERE m.year_released >= EXTRACT(YEAR FROM NOW()) - 2 AND m.poster_path IS NOT NULL
       ORDER BY m.release_date DESC NULLS LAST LIMIT 25`,
    ),
    // Genre rows
    fetchGenreRow("Action", "movie"),
    fetchGenreRow("Drama", "movie"),
    fetchGenreRow("Comedy", "movie"),
    fetchGenreRow("Crime", "movie"),
    fetchGenreRow("Thriller", "movie"),
    fetchGenreRow("Science Fiction", "movie"),
    fetchGenreRow("Horror", "movie"),
    fetchGenreRow("Action & Adventure", "tv"),
    fetchGenreRow("Drama", "tv"),
    fetchGenreRow("Comedy", "tv"),
    fetchGenreRow("Crime", "tv"),
    fetchGenreRow("Animation", "tv"),
    fetchGenreRow("Documentary", "movie"),
  ]);

  // ── Attach genres to all rows ───────────────────────────────────────────────
  const allMovieItems = [
    ...trendingMovies.rows,
    ...topRatedMovies.rows,
    ...newMovies.rows,
    ...actionMovies,
    ...dramaMovies,
    ...comedyMovies,
    ...crimeMovies,
    ...thrillerMovies,
    ...scifiMovies,
    ...horrorMovies,
    ...documentaries,
  ].filter((i) => i.media_type === "movie");

  const allTVItems = [
    ...trendingTV.rows,
    ...topRatedTV.rows,
    ...actionTV,
    ...dramaTV,
    ...comedyTV,
    ...crimeTV,
    ...animationTV,
  ].filter((i) => i.media_type === "tv");

  const movieIds = [...new Set(allMovieItems.map((i) => i.id))];
  const tvIds = [...new Set(allTVItems.map((i) => i.id))];

  const [movieGenreMap, tvGenreMap] = await Promise.all([
    attachGenres(movieIds, "movie"),
    attachGenres(tvIds, "tv"),
  ]);

  const applyGenres = (items: MediaItem[]) =>
    items.map((item) => ({
      ...item,
      genres:
        item.media_type === "movie"
          ? (movieGenreMap.get(item.id) ?? [])
          : (tvGenreMap.get(item.id) ?? []),
    }));

  // ── Pick hero (best backdrop from trending) ────────────────────────────────
  const heroPool = [...trendingMovies.rows, ...trendingTV.rows]
    .filter((i) => i.backdrop_path && i.overview)
    .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
  const hero = heroPool[0]
    ? {
        ...heroPool[0],
        genres:
          (heroPool[0].media_type === "movie" ? movieGenreMap : tvGenreMap).get(
            heroPool[0].id,
          ) ?? [],
      }
    : null;

  // ── Build rows ─────────────────────────────────────────────────────────────
  const rows = [
    {
      id: "trending_movies",
      title: "Trending Movies",
      type: "movie" as const,
      items: applyGenres(trendingMovies.rows),
    },
    {
      id: "trending_tv",
      title: "Popular on TV",
      type: "tv",
      items: applyGenres(trendingTV.rows),
    },
    {
      id: "top_rated_movies",
      title: "Top Rated Movies",
      type: "movie" as const,
      items: applyGenres(topRatedMovies.rows),
    },
    {
      id: "top_rated_tv",
      title: "Critically Acclaimed Shows",
      type: "tv",
      items: applyGenres(topRatedTV.rows),
    },
    {
      id: "new_movies",
      title: "New Releases",
      type: "movie" as const,
      items: applyGenres(newMovies.rows),
    },
    {
      id: "action_movies",
      title: "Action & Thrills",
      type: "movie" as const,
      items: applyGenres(actionMovies),
    },
    {
      id: "drama_movies",
      title: "Award-Winning Dramas",
      type: "movie" as const,
      items: applyGenres(dramaMovies),
    },
    {
      id: "crime_movies",
      title: "Crime & Mystery",
      type: "movie" as const,
      items: applyGenres(crimeMovies),
    },
    {
      id: "thriller_movies",
      title: "Edge-of-Your-Seat Thrillers",
      type: "movie" as const,
      items: applyGenres(thrillerMovies),
    },
    {
      id: "scifi_movies",
      title: "Sci-Fi & Fantasy",
      type: "movie" as const,
      items: applyGenres(scifiMovies),
    },
    {
      id: "horror_movies",
      title: "Horror",
      type: "movie" as const,
      items: applyGenres(horrorMovies),
    },
    {
      id: "comedy_movies",
      title: "Feel-Good Comedies",
      type: "movie" as const,
      items: applyGenres(comedyMovies),
    },
    {
      id: "action_tv",
      title: "Action & Adventure Shows",
      type: "tv",
      items: applyGenres(actionTV),
    },
    {
      id: "drama_tv",
      title: "Dramatic Series",
      type: "tv",
      items: applyGenres(dramaTV),
    },
    {
      id: "crime_tv",
      title: "Crime Series",
      type: "tv",
      items: applyGenres(crimeTV),
    },
    {
      id: "animation_tv",
      title: "Animated Series",
      type: "tv",
      items: applyGenres(animationTV),
    },
    {
      id: "comedy_tv",
      title: "Comedy Shows",
      type: "tv",
      items: applyGenres(comedyTV),
    },
    {
      id: "documentaries",
      title: "Documentaries",
      type: "movie" as const,
      items: applyGenres(documentaries),
    },
  ].filter((r) => r.items.length >= 4) as HomeRow[];

  const result: HomeResponse = { hero, rows };
  cache.set(cacheKey, result, TTL.HOME);
  return result;
};
