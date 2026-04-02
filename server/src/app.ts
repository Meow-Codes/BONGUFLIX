import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { initDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import { cache } from "./utils/cache.js";

const app = express();
const PORT = Number(process.env.PORT) || 6942;

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow TMDB image proxying
}));

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  process.env.FRONTEND_TEST_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// Trust the first proxy (e.g., Nginx, Vercel, AWS ALB) for correct rate limiting IP
app.set("trust proxy", 1);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ─── Rate limiting ────────────────────────────────────────────────────────────

// Strict: auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, try again in 15 minutes" },
});

// Generous: media endpoints (they're cached anyway)
const mediaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded" },
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);

// Add Cache-Control header for media endpoints since they are globally cached in Redis
app.use("/api", mediaLimiter, (req, res, next) => {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "public, max-age=300"); // 5 minutes 
  }
  next();
}, mediaRoutes);

// ─── Health / diagnostics ─────────────────────────────────────────────────────
app.get("/", (_req: Request, res: Response) => {
  res.json({ service: "BONGUFLIX API", status: "running" });
});

app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/readyz", (_req: Request, res: Response) => {
  res.json({ status: "ready" });
});

// Expose cache stats in dev
if (process.env.NODE_ENV !== "production") {
  app.get("/debug/cache", (_req, res) => {
    res.json(cache.stats());
  });
}

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[unhandled]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 BONGUFLIX API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });