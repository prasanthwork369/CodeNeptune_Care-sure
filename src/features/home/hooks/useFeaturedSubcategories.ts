import {
  categoryApi,
  type ApiFeaturedSubcategory,
} from "@/src/api/category.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useCachedSeed, withSqliteCache } from "@/src/lib/sqlite/cache";

export const useFeaturedSubcategories = () => {
  const cachedSub = useCachedSeed<ApiFeaturedSubcategory[]>(
    "featured_subcategories",
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.CATALOG.FEATURED_SUBCATEGORIES,
    queryFn: withSqliteCache("featured_subcategories", () =>
      categoryApi.getFeaturedSubcategories(4),
    ),
    initialData: () => cachedSub?.data,
    initialDataUpdatedAt: () => cachedSub?.updatedAt ?? 0,
    staleTime: 10 * 60_000,
  });

  return {
    subcategories: data ?? [],
    isLoading,
    error,
    refetch,
  };
};
