import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { apiCache, withSqliteCache } from "@/src/lib/sqlite/cache";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { categoryApi, type ApiCategoryFamily } from "../../api/category.api";
import { resolveAssetUrl } from "../../utils/urls";
import type { CategoryProduct } from "../../types/category";
import type { CategoryCard, CategoryTab } from "../../types/home";

const CARD_BG_COLORS = [
  "#E1F7F3",
  "#F0F5FF",
  "#F2F9E1",
  "#FFF0F5",
  "#EBF4FF",
  "#EBFBFA",
  "#FFFDE7",
];

export const useCategories = () => {
  // Read once per mount — this is a blocking getFirstSync + JSON.parse, and
  // React Query only consumes it to seed initialData.
  const [cachedFamilies] = useState(() =>
    apiCache.getWithMeta<ApiCategoryFamily[]>("category_family_map"),
  );

  const {
    data: families = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.CATALOG.CATEGORY_MAP,
    queryFn: withSqliteCache(
      "category_family_map",
      categoryApi.getCategoryFamilyMap,
    ),
    initialData: () => cachedFamilies?.data,
    initialDataUpdatedAt: () => cachedFamilies?.updatedAt ?? 0,
    staleTime: 5 * 60_000,
  });

  const tabs: CategoryTab[] = useMemo(
    () =>
      families.map((family) => {
        // `{ uri: undefined }` is truthy, so callers would render a blank icon.
        const toSource = (url?: string) => (url ? { uri: url } : undefined);
        return {
          id: family.id,
          label: family.mobileShortName || family.name,
          imageActive:
            toSource(family.mobIconUrl) ?? toSource(family.iconActive),
          imageInactive:
            toSource(family.mobIconUrl) ?? toSource(family.iconInactive),
        };
      }),
    [families],
  );

  const cards: CategoryCard[] = useMemo(() => {
    const seenCardIds = new Set<string>();
    return families.flatMap((family) =>
      (family.subCategories ?? [])
        .filter((sub) => {
          if (seenCardIds.has(sub.id)) return false;
          seenCardIds.add(sub.id);
          return true;
        })
        .map((sub, idx) => ({
          id: sub.id,
          slug: sub.slug,
          familySlug: family.slug,
          label: sub.name,
          image: sub.imageUrl ? { uri: resolveAssetUrl(sub.imageUrl) } : null,
          bgColor: CARD_BG_COLORS[idx % CARD_BG_COLORS.length],
          tabId: family.id,
        })),
    );
  }, [families]);

  return { tabs, cards, isLoading, error, refetch };
};

export const useCategoryProducts = (params: {
  categorySlug: string;
  subCategorySlug?: string;
  childCategorySlug?: string;
  page?: number;
  limit?: number;
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.CATALOG.CATEGORY_PRODUCTS(
      params.subCategorySlug || params.categorySlug,
    ),

    queryFn: () =>
      categoryApi.getCategoryProducts({ page: 1, limit: 40, ...params }),
    enabled: !!params.categorySlug,
    staleTime: 60_000,
  });

  // Memoized: this ran on every render, and the dedup was O(n²) over a 40-item
  // page. A Set keeps it linear and holds the array identity stable for the grid.
  const products: CategoryProduct[] = useMemo(() => {
    const seenIds = new Set<string>();
    return (data?.items ?? [])
      .filter((item) => {
        if (seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
      })
      .map((item) => {
        const disc = parseFloat(String(item.discountPercentage));
        const mrp = parseFloat(String(item.price));
        return {
          id: item.id,
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          description:
            item.unit && item.packSize && item.dosageForm
              ? `${item.unit.charAt(0).toUpperCase() + item.unit.slice(1)} of ${item.packSize} ${item.dosageForm}s`
              : item.packSize || item.brandName,
          price:
            disc > 0 ? parseFloat((mrp * (1 - disc / 100)).toFixed(2)) : mrp,
          originalPrice: disc > 0 ? mrp : undefined,
          discount: disc > 0 ? `${disc}% OFF` : undefined,
          discountPercent: disc || 0,
          image: item.thumbnailUrl
            ? { uri: resolveAssetUrl(item.thumbnailUrl) }
            : null,
          packSize: String(item.packSize ?? ""),
          unit: item.unit ?? "",
        };
      });
  }, [data?.items]);

  return { products, total: data?.total ?? 0, isLoading, error, refetch };
};
