import { useQuery } from "@tanstack/react-query";
import { homeApi } from "../../api/home.api";
import type { ApiAppContent } from "../../types/home";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useCachedSeed, withSqliteCache } from "@/src/lib/sqlite/cache";
import { useCategories } from "./useCategories";

export const useHome = () => {
  const {
    tabs,
    cards,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const cachedContent = useCachedSeed<ApiAppContent>("app_contents");

  const {
    data: appContent,
    isLoading: isContentLoading,
    error: contentError,
    refetch: refetchContent,
  } = useQuery({
    queryKey: QUERY_KEYS.APP.CONTENTS,
    queryFn: withSqliteCache("app_contents", homeApi.getAppContents),
    initialData: () => cachedContent?.data,
    initialDataUpdatedAt: () => cachedContent?.updatedAt ?? 0,
    staleTime: 10 * 60_000,
  });

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
