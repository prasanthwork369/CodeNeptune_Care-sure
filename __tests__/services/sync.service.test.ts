import { syncService } from "@/src/services/sync.service";
import { apiClient } from "@/src/api/client";
import { db } from "@/src/lib/sqlite/db";
import { apiCache } from "@/src/lib/sqlite/cache";
import { homeApi } from "@/src/api/home.api";
import { QueryClient } from "@tanstack/react-query";

jest.mock("@/src/api/client", () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

jest.mock("@/src/lib/sqlite/cache", () => ({
  apiCache: {
    set: jest.fn(),
  },
}));

jest.mock("@/src/api/home.api", () => ({
  homeApi: {
    getAppContents: jest.fn(),
  },
}));

jest.mock("@/src/api/category.api", () => ({
  categoryApi: {
    getCategoryFamilyMap: jest.fn(),
    getFeaturedSubcategories: jest.fn(),
  },
}));

jest.mock("@/src/api/medicine.api", () => ({
  medicineApi: {
    getFeaturedCards: jest.fn(),
  },
}));

describe("syncService — Offline Sync & Cache Invalidation", () => {
  let mockQueryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient = new QueryClient();
    jest
      .spyOn(mockQueryClient, "invalidateQueries")
      .mockResolvedValue(undefined as any);
  });

  it("reads local sync timestamps from sync_metadata SQLite table", async () => {
    (db.getAllSync as jest.Mock).mockReturnValueOnce([
      {
        component_name: "appContents",
        last_sync_time: "2026-01-01T10:00:00.000Z",
      },
    ]);

    const timestamps = await syncService.getSyncTimestamps();
    expect(timestamps.appContents).toBe("2026-01-01T10:00:00.000Z");
    expect(timestamps.categoryFamilyMap).toBe("1970-01-01T00:00:00.000Z");
  });

  it("updates individual sync timestamp in SQLite database", async () => {
    await syncService.updateSyncTimestamp(
      "appContents",
      "2026-07-21T12:00:00.000Z",
    );
    expect(db.runSync).toHaveBeenCalledWith(
      "INSERT OR REPLACE INTO sync_metadata (component_name, last_sync_time) VALUES (?, ?)",
      ["appContents", "2026-07-21T12:00:00.000Z"],
    );
  });

  it("fetches updated components and invalidates query keys when needsSync is true", async () => {
    (db.getAllSync as jest.Mock).mockReturnValue([]);
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        components: {
          appContents: {
            needsSync: true,
            latestServerTimestamp: "2026-07-21T15:00:00.000Z",
          },
          categoryFamilyMap: { needsSync: false },
        },
      },
    });

    const mockContents = { banners: [{ id: "b1" }] };
    (homeApi.getAppContents as jest.Mock).mockResolvedValueOnce(mockContents);

    await syncService.performSync(mockQueryClient, false);

    expect(homeApi.getAppContents).toHaveBeenCalledTimes(1);
    expect(apiCache.set).toHaveBeenCalledWith("app_contents", mockContents);
    expect(db.runSync).toHaveBeenCalledWith(
      "INSERT OR REPLACE INTO sync_metadata (component_name, last_sync_time) VALUES (?, ?)",
      ["appContents", "2026-07-21T15:00:00.000Z"],
    );
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
  });
});
