import { Request, Response } from "express";
import { getUserBySlug } from "../services/user.service.js";

export const getUser = async (
  req: Request<{ slug: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({ error: "slug is required" });
      return;
    }

    if (Array.isArray(slug)) {
      res.status(400).json({ error: "Invalid slug" });
      return;
    }

    const userData = await getUserBySlug(slug);
    res.json(userData);
  } catch (err: any) {
    res.status(404).json({ error: err.message || "User not found" });
  }
};
