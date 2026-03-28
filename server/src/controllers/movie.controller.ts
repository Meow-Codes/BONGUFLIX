import { Request, Response } from "express";
import * as movieService from "../services/movie.service.js";

const getQueryParam = (param: unknown): string | undefined => {
  if (typeof param === "string") return param;
  if (Array.isArray(param)) return param[0];
  return undefined;
};

const getNumberQueryParam = (param: unknown, defaultValue: number): number => {
  const value = getQueryParam(param);
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getIdParam = (param: unknown): number | null => {
  if (typeof param !== "string") return null;
  const id = parseInt(param, 10);
  return isNaN(id) ? null : id;
};

export const listMovies = async (req: Request, res: Response) => {
  try {
    const data = await movieService.getMovies(req);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const movieDetail = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const movie = await movieService.getMovieById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const trendingMovies = async (req: Request, res: Response) => {
  try {
    const limit = getNumberQueryParam(req.query.limit, 20);

    const data = await movieService.getTrendingMovies(limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const topRatedMovies = async (req: Request, res: Response) => {
  try {
    const limit = getNumberQueryParam(req.query.limit, 20);

    const data = await movieService.getTopRatedMovies(limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const newMovies = async (req: Request, res: Response) => {
  try {
    const limit = getNumberQueryParam(req.query.limit, 20);

    const data = await movieService.getNewMovies(limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const moviesByGenre = async (req: Request, res: Response) => {
  try {
    const rawGenre = req.params.genre;

    const genre =
      typeof rawGenre === "string"
        ? rawGenre
        : Array.isArray(rawGenre)
        ? rawGenre[0]
        : undefined;

    if (!genre) {
      return res.status(400).json({ error: "Genre is required" });
    }

    const limit = getNumberQueryParam(req.query.limit, 20);

    const data = await movieService.getMoviesByGenre(genre, limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const similarMovies = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const limit = getNumberQueryParam(req.query.limit, 12);

    const data = await movieService.getSimilarMovies(id, limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};