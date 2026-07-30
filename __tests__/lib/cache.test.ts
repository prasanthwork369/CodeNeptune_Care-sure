import { apiCache, withSqliteCache } from "@/src/lib/sqlite/cache";
import { db } from "@/src/lib/sqlite/db";

describe("apiCache & withSqliteCache — SQLite Offline Fallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("apiCache CRUD Operations", () => {
    it("get returns parsed JSON when DB row exists", () => {
      const mockData = { id: "p1", name: "Paracip" };
      (db.getFirstSync as jest.Mock).mockReturnValueOnce({
        data: JSON.stringify(mockData),
      });

      const result = apiCache.get<typeof mockData>("profile");
      expect(db.getFirstSync).toHaveBeenCalledWith(
        "SELECT data FROM api_cache WHERE key = ?",
        ["profile"],
      );
      expect(result).toEqual(mockData);
    });

    it("get returns null when key does not exist or DB error occurs", () => {
      (db.getFirstSync as jest.Mock).mockReturnValueOnce(null);
      expect(apiCache.get("unknown_key")).toBeNull();

      (db.getFirstSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error("DB read error");
      });
      expect(apiCache.get("errored_key")).toBeNull();
    });

    it("getWithMeta returns data and timestamp", () => {
      const timestamp = 1700000000000;
      const mockData = { item: "cached" };
      (db.getFirstSync as jest.Mock).mockReturnValueOnce({
        data: JSON.stringify(mockData),
        updated_at: timestamp,
      });

      const result = apiCache.getWithMeta<typeof mockData>("item_key");
      expect(result).toEqual({ data: mockData, updatedAt: timestamp });
    });

    it("set executes INSERT OR REPLACE with current timestamp", () => {
      const mockObj = { category: "otc" };
      apiCache.set("category_key", mockObj);

      expect(db.runSync).toHaveBeenCalledWith(
        "INSERT OR REPLACE INTO api_cache (key, data, updated_at) VALUES (?, ?, ?)",
        ["category_key", JSON.stringify(mockObj), expect.any(Number)],
      );
    });

    it("clear executes DELETE FROM api_cache table", () => {
      apiCache.clear();
      expect(db.runSync).toHaveBeenCalledWith("DELETE FROM api_cache");
    });
  });

  describe("withSqliteCache Wrapper", () => {
    it("returns fresh data and caches to SQLite on successful network fetch", async () => {
      const freshData = { status: "fresh" };
      const mockFetcher = jest.fn().mockResolvedValue(freshData);

      const wrappedFn = withSqliteCache("test_key", mockFetcher);
      const result = await wrappedFn();

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(db.runSync).toHaveBeenCalledWith(
        "INSERT OR REPLACE INTO api_cache (key, data, updated_at) VALUES (?, ?, ?)",
        ["test_key", JSON.stringify(freshData), expect.any(Number)],
      );
      expect(result).toEqual(freshData);
    });

    it("falls back to SQLite cache when network fetch throws an error", async () => {
      const cachedData = { status: "cached_offline" };
      const mockFetcher = jest
        .fn()
        .mockRejectedValue(new Error("Network failed"));
      (db.getFirstSync as jest.Mock).mockReturnValueOnce({
        data: JSON.stringify(cachedData),
      });

      const wrappedFn = withSqliteCache("test_key", mockFetcher);
      const result = await wrappedFn();

      expect(mockFetcher).toHaveBeenCalledTimes(1);
      expect(result).toEqual(cachedData);
    });

    it("re-throws network error when fetch fails and no cached entry exists", async () => {
      const mockFetcher = jest
        .fn()
        .mockRejectedValue(new Error("Network failed"));
      (db.getFirstSync as jest.Mock).mockReturnValueOnce(null);

      const wrappedFn = withSqliteCache("uncached_key", mockFetcher);
      await expect(wrappedFn()).rejects.toThrow("Network failed");
    });
  });
});
