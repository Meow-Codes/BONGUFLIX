/**
 * Lightweight in-process cache with TTL.
 * Avoids Redis dependency while still eliminating repeat DB hits for
 * hot paths like /home, /movies/trending, /tv/trending.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private hitCount = 0;
  private missCount = 0;

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) { this.missCount++; return null; }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return null;
    }
    this.hitCount++;
    return entry.value as T;
  }

  del(key: string): void {
    this.store.delete(key);
  }

  delPattern(pattern: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) this.store.delete(key);
    }
  }

  stats() {
    return {
      keys: this.store.size,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: this.hitCount + this.missCount === 0
        ? 0
        : ((this.hitCount / (this.hitCount + this.missCount)) * 100).toFixed(1) + "%",
    };
  }

  // Purge expired entries — call periodically
  purge(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

export const cache = new MemoryCache();

// Auto-purge every 5 minutes
setInterval(() => cache.purge(), 5 * 60 * 1000);

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