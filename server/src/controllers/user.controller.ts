import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import {
  getUserBySlug,
  completeOnboarding,
  flushUserPreferences,
  updateUserPreferences,
  type OnboardingPayload,
} from "../services/user.service.js";
import * as genreService from "../services/genre.service.js";

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

export const getOnboardingOptions = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [genres, keywords] = await Promise.all([
      genreService.getOnboardingGenreNames(),
      Promise.resolve(genreService.getOnboardingInterestKeywords()),
    ]);
    res.json({ genres, keywords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const postOnboarding = async (
  req: Request<{ slug: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;
    const body = req.body as Partial<OnboardingPayload>;
    await completeOnboarding(slug, {
      displayName: body.displayName ?? "",
      profilePic: body.profilePic ?? null,
      selections: Array.isArray(body.selections) ? body.selections : [],
      contentStyle: body.contentStyle ?? "mixed",
    });
    res.json({ success: true });
  } catch (err: any) {
    const map: Record<string, number> = {
      INVALID_NAME: 400,
      SELECTIONS_REQUIRED: 400,
      IMAGE_TOO_LARGE: 413,
    };
    const code = map[err?.message];
    if (code) {
      res.status(code).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const patchPreferences = async (
  req: Request<{ slug: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;
    const body = req.body as { preferences?: Record<string, unknown>; profilePic?: string | null };
    if (!body.preferences || typeof body.preferences !== "object") {
      res.status(400).json({ error: "preferences object required" });
      return;
    }
    const current = await getUserBySlug(slug);
    const base =
      current.preferences && typeof current.preferences === "object"
        ? (current.preferences as Record<string, unknown>)
        : {};
    const merged = { ...base, ...body.preferences };
    await updateUserPreferences(slug, merged, body.profilePic);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Update failed" });
  }
};

export const postFlushPreferences = async (
  req: Request<{ slug: string }>,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;
    await flushUserPreferences(slug);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const postUploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      res.status(503).json({
        error: "Avatar upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
      });
      return;
    }
    type Uploaded = { buffer: Buffer; mimetype: string };
    const file = (req as Request & { file?: Uploaded }).file;
    if (!file?.buffer) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "bonguflix/avatars",
      resource_type: "image",
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};
