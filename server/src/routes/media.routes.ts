import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

// Controllers
import {
  listMovies,
  movieDetail,
  trendingMovies,
  topRatedMovies,
  newMovies,
  similarMovies,
  moviesByGenre,
} from "../controllers/movie.controller.js";

import {
  listTV,
  tvDetail,
  trendingTV,
  topRatedTV,
  similarTV,
  tvByGenre,
  tvSeasons,
  tvEpisodes,
} from "../controllers/tv.controller.js";

import {
  home,
  searchMedia,
  searchAutocomplete,
  genres,
  genreStats,
  personDetail,
  popularPeople,
} from "../controllers/media.controller.js";

const router: Router = Router();

// All media routes require a valid session
router.use(requireAuth);

// ─── Home ─────────────────────────────────────────────────────────────────────
router.get("/home", home);

// ─── Search ───────────────────────────────────────────────────────────────────
router.get("/search", searchMedia);
router.get("/search/autocomplete", searchAutocomplete);

// ─── Genres ───────────────────────────────────────────────────────────────────
router.get("/genres", genres);
router.get("/genres/stats", genreStats);

// ─── Movies ───────────────────────────────────────────────────────────────────
router.get("/movies", listMovies);
router.get("/movies/trending", trendingMovies);
router.get("/movies/top-rated", topRatedMovies);
router.get("/movies/new", newMovies);
router.get("/movies/genre/:genre", moviesByGenre);
router.get("/movies/:id", movieDetail);
router.get("/movies/:id/similar", similarMovies);

// ─── TV Shows ─────────────────────────────────────────────────────────────────
router.get("/tv", listTV);
router.get("/tv/trending", trendingTV);
router.get("/tv/top-rated", topRatedTV);
router.get("/tv/genre/:genre", tvByGenre);
router.get("/tv/:id", tvDetail);
router.get("/tv/:id/similar", similarTV);
router.get("/tv/:id/seasons", tvSeasons);
router.get("/tv/:id/seasons/:season/episodes", tvEpisodes);

// ─── People ───────────────────────────────────────────────────────────────────
router.get("/people/popular", popularPeople);
router.get("/people/:id", personDetail);

export default router;