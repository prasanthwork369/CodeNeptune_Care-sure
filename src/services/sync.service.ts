import { apiClient } from "../api/client";
import { API_ENDPOINTS } from "../utils/urls";
import { apiCache } from "../lib/sqlite/cache";
import { db } from "../lib/sqlite/db";
import { homeApi } from "../features/home/api/home.api";
import { categoryApi } from "../features/categories/api/category.api";
import { medicineApi } from "../features/product/api/medicine.api";
import { orderApi } from "../features/orders/api/order.api";
import { QUERY_KEYS } from "../lib/react-query/queryKeys";
import { QueryClient } from "@tanstack/react-query";

export interface SyncTimestamps {
  appContents: string;
  categoryFamilyMap: string;
  featuredSubcategories: string;
  featuredMedicines: string;
  frequentlyOrdered: string;
}

const DEFAULT_TIMESTAMPS: SyncTimestamps = {
  appContents: "1970-01-01T00:00:00.000Z",
  categoryFamilyMap: "1970-01-01T00:00:00.000Z",
  featuredSubcategories: "1970-01-01T00:00:00.000Z",
  featuredMedicines: "1970-01-01T00:00:00.000Z",
  frequentlyOrdered: "1970-01-01T00:00:00.000Z",
};

export const syncService = {
  async getSyncTimestamps(): Promise<SyncTimestamps> {
    try {
      const rows = db.getAllSync<{
        component_name: string;
        last_sync_time: string;
      }>("SELECT component_name, last_sync_time FROM sync_metadata");

      const timestamps = { ...DEFAULT_TIMESTAMPS };
      for (const row of rows) {
        const name = row.component_name as keyof SyncTimestamps;
        if (name in DEFAULT_TIMESTAMPS) {
          timestamps[name] = row.last_sync_time;
        }
      }
      return timestamps;
    } catch {
      return { ...DEFAULT_TIMESTAMPS };
    }
  },

  async updateSyncTimestamp(
    componentName: keyof SyncTimestamps,
    timestamp: string,
  ): Promise<void> {
    try {
      db.runSync(
        "INSERT OR REPLACE INTO sync_metadata (component_name, last_sync_time) VALUES (?, ?)",
        [componentName, timestamp],
      );
    } catch (e) {
      if (__DEV__)
        console.error(
          `[SyncService] Failed to update sync timestamp for ${componentName}:`,
          e,
        );
    }
  },

  async performSync(
    queryClient: QueryClient,
    isAuthenticated: boolean = true,
  ): Promise<void> {
    try {
      const localTimestamps = await this.getSyncTimestamps();

      const componentsPayload: Record<string, string> = {
        appContents: localTimestamps.appContents,
        categoryFamilyMap: localTimestamps.categoryFamilyMap,
        featuredSubcategories: localTimestamps.featuredSubcategories,
        featuredMedicines: localTimestamps.featuredMedicines,
      };

      if (isAuthenticated) {
        componentsPayload.frequentlyOrdered = localTimestamps.frequentlyOrdered;
      }

      const response = await apiClient.post(API_ENDPOINTS.SYNC_CHECK, {
        components: componentsPayload,
      });

      if (!response.data || response.data.success !== true) {
        if (__DEV__)
          console.warn(
            "[SyncService] Sync check response unsuccessful:",
            response.data,
          );
        return;
      }

      const { components } = response.data;

      // Each block seeds the query cache with the payload it just fetched.
      // Invalidating instead would refetch the same data over the network and
      // re-write it to SQLite through withSqliteCache — two round trips and two
      // blocking writes for data already in hand.

      // 1. appContents
      if (components.appContents?.needsSync) {
        try {
          const data = await homeApi.getAppContents();
          apiCache.set("app_contents", data);
          await this.updateSyncTimestamp(
            "appContents",
            components.appContents.latestServerTimestamp,
          );
          queryClient.setQueryData(QUERY_KEYS.APP.CONTENTS, data);
        } catch (e) {
          if (__DEV__)
            console.error("[SyncService] Failed to sync appContents:", e);
        }
      }

      // 2. categoryFamilyMap
      if (components.categoryFamilyMap?.needsSync) {
        try {
          const data = await categoryApi.getCategoryFamilyMap();
          apiCache.set("category_family_map", data);
          await this.updateSyncTimestamp(
            "categoryFamilyMap",
            components.categoryFamilyMap.latestServerTimestamp,
          );
          queryClient.setQueryData(QUERY_KEYS.CATALOG.CATEGORY_MAP, data);
        } catch (e) {
          if (__DEV__)
            console.error("[SyncService] Failed to sync categoryFamilyMap:", e);
        }
      }

      // 3. featuredSubcategories
      if (components.featuredSubcategories?.needsSync) {
        try {
          const data = await categoryApi.getFeaturedSubcategories(4);
          apiCache.set("featured_subcategories", data);
          await this.updateSyncTimestamp(
            "featuredSubcategories",
            components.featuredSubcategories.latestServerTimestamp,
          );
          queryClient.setQueryData(
            QUERY_KEYS.CATALOG.FEATURED_SUBCATEGORIES,
            data,
          );
        } catch (e) {
          if (__DEV__)
            console.error(
              "[SyncService] Failed to sync featuredSubcategories:",
              e,
            );
        }
      }

      // 4. featuredMedicines
      if (components.featuredMedicines?.needsSync) {
        try {
          const data = await medicineApi.getFeaturedCards();
          apiCache.set("featured_medicines", data);
          await this.updateSyncTimestamp(
            "featuredMedicines",
            components.featuredMedicines.latestServerTimestamp,
          );
          queryClient.setQueryData(QUERY_KEYS.CATALOG.FEATURED_MEDICINES, data);
        } catch (e) {
          if (__DEV__)
            console.error("[SyncService] Failed to sync featuredMedicines:", e);
        }
      }

      // 5. frequentlyOrdered
      if (isAuthenticated && components.frequentlyOrdered?.needsSync) {
        try {
          const data = await orderApi.getFrequentlyOrdered({ limit: 5 });
          apiCache.set("frequently_ordered", data);
          await this.updateSyncTimestamp(
            "frequentlyOrdered",
            components.frequentlyOrdered.latestServerTimestamp,
          );
          // setQueriesData, not setQueryData: this key carries the caller's
          // params object, so match on the prefix instead of guessing it.
          queryClient.setQueriesData(
            { queryKey: ["frequently-ordered"] },
            data,
          );
        } catch (e) {
          if (__DEV__)
            console.error("[SyncService] Failed to sync frequentlyOrdered:", e);
        }
      }
    } catch (error) {
      if (__DEV__)
        console.error("[SyncService] Sync check execution error:", error);
    }
  },
};
