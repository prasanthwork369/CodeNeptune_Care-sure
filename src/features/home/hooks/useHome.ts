import { useQuery } from "@tanstack/react-query";
import { homeApi } from "@/src/features/home/api/home.api";
import type { ApiAppContent } from "@/src/features/home/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { BACKGROUND_QUERY_META } from "@/src/lib/react-query/queryClient";
import { useCachedSeed, withSqliteCache } from "@/src/lib/sqlite/cache";
import { useCategories } from "@/src/features/categories/hooks/useCategories";

/**
 * Narrow subscription for app content (promise, banners, etc.) without subscribing to categories.
 */
export const useAppContent = () => {
  const cachedContent = useCachedSeed<ApiAppContent>("app_contents");

  return useQuery({
    queryKey: QUERY_KEYS.APP.CONTENTS,
    queryFn: withSqliteCache("app_contents", homeApi.getAppContents),
    initialData: () => cachedContent?.data,
    initialDataUpdatedAt: () => cachedContent?.updatedAt ?? 0,
    staleTime: 10 * 60_000,
    // The SQLite seed above covers the common case; this only matters on a
    // brand-new install with no seed yet, where a 401 shouldn't toast on top
    // of whatever the auth interceptor's refresh/logout flow already does.
    meta: BACKGROUND_QUERY_META,
  });
};

export const useHome = () => {
  const {
    tabs,
    cards,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const {
    data: appContent,
    isLoading: isContentLoading,
    error: contentError,
    refetch: refetchContent,
  } = useAppContent();

  const refetch = async () => {
    await Promise.all([refetchCategories(), refetchContent()]);
  };

  return {
    tabs,
    cards,
    appContent,
    isLoading: isCategoriesLoading || isContentLoading,
    error: categoriesError || contentError,
    refetch,
  };
};
