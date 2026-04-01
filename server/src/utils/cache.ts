/**
 * Lightweight in-process cache with TTL.
 * Avoids Redis dependency while still eliminating repeat DB hits for
 * hot paths like /home, /movies/trending, /tv/trending.
 */

import { createClient } from "redis";

// Define our Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    connectTimeout: 2000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000)
  }
});

let isRedisConnected = false;

redisClient.on("error", (err) => {
  const msg = err instanceof Error ? err.message : String(err);
  if (!msg.includes("ECONNREFUSED")) {
    console.error("Redis Client Error", err);
  }
  isRedisConnected = false;
});

redisClient.on("ready", () => {
  isRedisConnected = true;
});

// Connect automatically
(async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully");
  } catch (err) {
    console.error("Failed to connect to Redis", err);
  }
})();

class RedisCacheWrapper {
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!isRedisConnected) return; // Fallback silently
    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to set cache for ${key}:`, err);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!isRedisConnected) return null; // Fallback to DB fetch
    try {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      console.error(`Failed to get cache for ${key}:`, err);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    if (!isRedisConnected) return;
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error(`Failed to delete cache for ${key}:`, err);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!isRedisConnected) return;
    try {
      const keys = await redisClient.keys(`*${pattern}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (err) {
      console.error(`Failed to delete pattern ${pattern}:`, err);
    }
  }

  stats() {
    return {
      status: redisClient.isOpen ? "connected" : "disconnected",
      type: "redis",
    };
  }
}

export const cache = new RedisCacheWrapper();

// TTL constants (seconds)
export const TTL = {
  HOME: 5 * 60,          // 5 min — hot path
  TRENDING: 5 * 60,
  LIST: 3 * 60,          // 3 min — paginated lists
  DETAIL: 10 * 60,       // 10 min — single item rarely changes
  SEARCH: 60,            // 1 min — search results
  GENRES: 60 * 60,       // 1 hour — genres almost never change
  PERSON: 15 * 60,
} as const;