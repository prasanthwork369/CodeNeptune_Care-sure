import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { homeApi } from "@/src/features/home/api/home.api";
import type { ApiAppContent, ApiHero } from "@/src/features/home/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { BACKGROUND_QUERY_META } from "@/src/lib/react-query/queryClient";
import { useCachedSeed, withSqliteCache } from "@/src/lib/sqlite/cache";
import { useCategories } from "@/src/features/categories/hooks/useCategories";

/**
 * Narrow subscription for app content (promise, banners, etc.) without subscribing to categories.
 */
export const useAppContent = () => {
  const cachedContent = useCachedSeed<ApiAppContent>("app_contents");

  const query = useQuery({
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

  // A refetch (pull-to-refresh, background revalidation) can land during a
  // CMS publish window and come back with a hero that has no image — don't
  // let that blank out an avatar that was already showing on screen.
  const [lastGoodHero, setLastGoodHero] = useState<ApiHero | undefined>(
    () => cachedContent?.data?.hero,
  );
  if (query.data?.hero?.image && query.data.hero !== lastGoodHero) {
    setLastGoodHero(query.data.hero);
  }

  // Memoized: without this, a fresh { ...query.data } object is built on
  // every render of anything reading this hook — not just on real data
  // changes — which breaks React Query's structural sharing and cascades
  // into a re-render (and image reload) of every Home section on every
  // unrelated re-render (cart ticks, wallet polling, etc).
  const heroToUse = lastGoodHero ?? query.data?.hero;
  const data = useMemo(
    () => (query.data ? { ...query.data, hero: heroToUse } : query.data),
    [query.data, heroToUse],
  );

  return { ...query, data };
};

export const useHome = () => {
  const {
    families,
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
    families,
    tabs,
    cards,
    appContent,
    isLoading: isCategoriesLoading || isContentLoading,
    error: categoriesError || contentError,
    refetch,
  };
};
