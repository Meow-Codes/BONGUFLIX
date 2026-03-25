import dotenv from "dotenv";
dotenv.config(); // Must be first — loads env before any other import reads it

import express, { Request, Response } from "express";
import cors from "cors";

import { initDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import recommendRoutes from "./routes/recommend.routes.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = Number(process.env.PORT) || 6942;

const allowedOrigin = [process.env.FRONTEND_URL, process.env.BACKEND_URL, "http://localhost:3000"].filter(Boolean) as string[]; // Filter out undefined

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigin.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recommend", recommendRoutes);

// Base
app.get("/", (_req: Request, res: Response) => {
  res.send("We got the api + render db. Now we can just cook");
});

// Health checks
app.get("/healthz", (_req: Request, res: Response) => {
  res.send("API is healthy and ready to serve requests!");
});

// Readiness probe — useful for container orchestration (K8s, Render, etc.)
app.get("/readyz", (_req: Request, res: Response) => {
  res.send("API is ready to race!!!!!!!");
});

// Initialize DB tables on startup then listen
initDB()
  .then(() => {
    console.log("DB tables initialized");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB init failed — server will not start:", err);
    process.exit(1);
  });