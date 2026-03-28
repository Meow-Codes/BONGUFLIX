import { Request, Response } from "express";
import * as tvService from "../services/tv.service.js";

const getParam = (param: unknown): string | undefined => {
  if (typeof param === "string") return param;
  if (Array.isArray(param)) return param[0];
  return undefined;
};

const getNumberQueryParam = (param: unknown, defaultValue: number): number => {
  const value = getParam(param);
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const getIdParam = (param: unknown): number | null => {
  const value = getParam(param);
  if (!value) return null;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

export const listTV = async (req: Request, res: Response) => {
  try {
    const data = await tvService.getTVShows(req);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const tvDetail = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const show = await tvService.getTVShowById(id);

    if (!show) {
      return res.status(404).json({ error: "TV show not found" });
    }

    res.json(show);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const trendingTV = async (req: Request, res: Response) => {
  try {
    const limit = getNumberQueryParam(req.query.limit, 20);
    const data = await tvService.getTrendingTV(limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const topRatedTV = async (req: Request, res: Response) => {
  try {
    const limit = getNumberQueryParam(req.query.limit, 20);
    const data = await tvService.getTopRatedTV(limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const tvByGenre = async (req: Request, res: Response) => {
  try {
    const genre = getParam(req.params.genre);

    if (!genre) {
      return res.status(400).json({ error: "Genre is required" });
    }

    const limit = getNumberQueryParam(req.query.limit, 20);

    const data = await tvService.getTVByGenre(genre, limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const similarTV = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const limit = getNumberQueryParam(req.query.limit, 12);

    const data = await tvService.getSimilarTV(id, limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const tvSeasons = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);

    if (id === null) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const data = await tvService.getSeasons(id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const tvEpisodes = async (req: Request, res: Response) => {
  try {
    const id = getIdParam(req.params.id);
    const season = getIdParam(req.params.season);

    if (id === null || season === null) {
      return res.status(400).json({ error: "Invalid ID or season" });
    }

    const data = await tvService.getEpisodes(id, season);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};