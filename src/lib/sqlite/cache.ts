import { db } from "./db";

export const apiCache = {
  get<T>(key: string): T | null {
    try {
      const row = db.getFirstSync<{ data: string }>(
        "SELECT data FROM api_cache WHERE key = ?",
        [key],
      );
      return row ? (JSON.parse(row.data) as T) : null;
    } catch {
      return null;
    }
  },

  /** Returns the cached value along with when it was last written, for staleness checks. */
  getWithMeta<T>(key: string): { data: T; updatedAt: number } | null {
    try {
      const row = db.getFirstSync<{ data: string; updated_at: number }>(
        "SELECT data, updated_at FROM api_cache WHERE key = ?",
        [key],
      );
      return row
        ? { data: JSON.parse(row.data) as T, updatedAt: row.updated_at }
        : null;
    } catch {
      return null;
    }
  },

  set(key: string, data: unknown): void {
    try {
      db.runSync(
        "INSERT OR REPLACE INTO api_cache (key, data, updated_at) VALUES (?, ?, ?)",
        [key, JSON.stringify(data), Date.now()],
      );
    } catch {
      // ignore write failures — cache is best-effort
    }
  },

  remove(key: string): void {
    try {
      db.runSync("DELETE FROM api_cache WHERE key = ?", [key]);
    } catch {
      // ignore
    }
  },

  /** Drops every cached response — used on logout so no account's data can be
   * served to the next user via the offline fallback. */
  clear(): void {
    try {
      db.runSync("DELETE FROM api_cache");
    } catch {
      // ignore
    }
  },
};

/**
 * Wraps a queryFn so its result is cached in SQLite on success and
 * served from SQLite if the network call fails (offline fallback).
 */
export const withSqliteCache = <T>(key: string, fetcher: () => Promise<T>) => {
  return async (): Promise<T> => {
    try {
      const data = await fetcher();
      apiCache.set(key, data);
      return data;
    } catch (err) {
      const cached = apiCache.get<T>(key);
      if (cached) return cached;
      throw err;
    }
  };
};
