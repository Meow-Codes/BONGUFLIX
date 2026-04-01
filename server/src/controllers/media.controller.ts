import { Request, Response } from "express";
import { pool } from "../config/db.js";
import * as homeService from "../services/home.service.js";
import * as searchService from "../services/search.service.js";
import * as genreService from "../services/genre.service.js";
import * as personService from "../services/person.service.js";

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


export const home = async (req: Request, res: Response) => {
  try {
    const slug = (req as Request & { user?: { slug?: string } }).user?.slug;
    let preferences: unknown = undefined;
    if (slug) {
      const { rows } = await pool.query<{ preferences: unknown }>(
        "SELECT preferences FROM users WHERE slug = $1",
        [slug],
      );
      preferences = rows[0]?.preferences ?? undefined;
    }
    const data = await homeService.getHomeData(preferences);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchMedia = async (req: Request, res: Response) => {
  try {
    const q = getParam(req.query.q) ?? "";
    const limit = getNumberQueryParam(req.query.limit, 20);

    const results = await searchService.search(q, limit);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchAutocomplete = async (req: Request, res: Response) => {
  try {
    const q = getParam(req.query.q) ?? "";

    const results = await searchService.autocomplete(q);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const genres = async (_req: Request, res: Response) => {
  try {
    const data = await genreService.getGenres();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const genreStats = async (_req: Request, res: Response) => {
  try {
    const data = await genreService.getGenreStats();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const popularPeople = async (req: Request, res: Response) => {
  try {
    const limit = getNumberQueryParam(req.query.limit, 20);

    const data = await personService.getPopularPeople(limit);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const personDetail = async (req: Request, res: Response) => {
  try {
    const idParam = getParam(req.params.id);
    const id = idParam ? parseInt(idParam, 10) : NaN;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const person = await personService.getPersonById(id);

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    res.json(person);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};