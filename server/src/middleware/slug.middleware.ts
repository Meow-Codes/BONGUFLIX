import { Request, Response, NextFunction } from "express";

/** Ensures :slug in the URL matches the authenticated session (prevents IDOR). */
export const requireMatchingSlug = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const sessionSlug = (req as Request & { user?: { slug?: string } }).user?.slug;
  const param = req.params.slug;
  if (typeof param !== "string" || param !== sessionSlug) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
};
