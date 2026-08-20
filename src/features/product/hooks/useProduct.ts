import { useCallback, useMemo } from "react";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { medicineApi } from "@/src/features/product/api/medicine.api";
import type { MedicineVariant } from "@/src/features/product/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { formatPackLabel } from "@/src/utils/packLabel";
import { resolveAssetUrl } from "@/src/utils/urls";

export type { MedicineVariant };

/**
 * Warms the exact PRODUCT_BY_ID cache entry useProduct() reads below, so a
 * card's onPressIn can have the fetch already in flight (or done) by the
 * time the user actually taps through to Product Details. Never throws — a
 * failed/slow prefetch just means the destination screen falls back to its
 * own normal fetch-on-mount, same as today.
 */
const prefetchProduct = (queryClient: QueryClient, productId: string): void => {
  if (!productId) return;
  void queryClient
    .prefetchQuery({
      queryKey: QUERY_KEYS.CATALOG.PRODUCT_BY_ID(productId),
      queryFn: () => medicineApi.getProductById(productId),
    })
    .catch(() => {});
};

/** Stable callback for wiring prefetchProduct into a card's onPressIn. */
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (productId: string) => prefetchProduct(queryClient, productId),
    [queryClient],
  );
};

export const getPackDivisor = (
  packSize: string | number | null | undefined,
  unit?: string,
): number => {
  if (!packSize) return 1;
  const containerUnits = [
    "bottle",
    "tube",
    "vial",
    "pack",
    "box",
    "inhaler",
    "syringe",
    "ampoule",
    "spray",
    "strip",
  ];
  if (unit && containerUnits.includes(unit.toLowerCase())) {
    return 1;
  }
  const parsed = parseFloat(String(packSize));
  return isNaN(parsed) || parsed <= 0 ? 1 : parsed;
};

export const useProduct = (productId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.CATALOG.PRODUCT_BY_ID(productId),
    queryFn: () => medicineApi.getProductById(productId),
    enabled: !!productId,
    staleTime: 0,
  });

  // Derives four objects from `data` only — memoized so consumers (effects,
  // memoized children) get a stable reference across re-renders that don't
  // change the underlying query data.
  const { product, recommendation, saltComposition, variants } =
    useMemo(() => {
      // Numbers for arithmetic only
      const price = data ? parseFloat(String(data.price)) : 0;
      const discountPct = data
        ? parseFloat(String(data.discountPercentage))
        : 0;
      const packSizeNum = data ? getPackDivisor(data.packSize, data.unit) : 1;
      // Use Math.floor to truncate trailing decimals, preventing rounding up (e.g. 199.50/200 = 0.99)
      const unitPrice =
        packSizeNum > 0 ? Math.floor((price / packSizeNum) * 100) / 100 : 0;

      const product = data
        ? {
            name: data.name,
            slug: data.slug,
            // For the canonical /{productType}/{slug}/{id} share URL. The detail
            // endpoint exposes `sourceType`, not `productType`; when it matches the
            // web's 1/2/3 codes the URL gets the right category, and productWebUrl
            // falls back to "medicines" otherwise — which still resolves, since the
            // web PDP fetches by id and only needs a valid type slug.
            productType: data.sourceType,
            requiresPrescription: data.requiresPrescription,
            isReturnable: data.is_returnable ?? false,
            manufacturer: data.manufacturer?.name ?? data.brand?.name ?? "",
            brandName: data.brand?.name ?? "",
            description:
              data.description ??
              `${data.dosageForm} | ${String(data.packSize ?? "").trim()}`,
            dosageForm: data.dosageForm,
            packSize: packSizeNum,
            packLabel: formatPackLabel({
              packSize: data.packSize,
              unit: data.unit,
              dosageForm: data.dosageForm,
            }),
            // Raw API strings for display
            priceDisplay: data.price,
            mrpDisplay: data.mrp ?? data.price,
            unitPriceDisplay: unitPrice.toFixed(2),
            // Numbers for calculations
            price,
            originalPrice:
              discountPct > 0 && data.mrp
                ? parseFloat(String(data.mrp))
                : undefined,
            savingsPercent: discountPct > 0 ? discountPct : undefined,
            image: data.thumbnailUrl
              ? { uri: resolveAssetUrl(data.thumbnailUrl) }
              : undefined,
            images: [
              ...(data.thumbnailUrl
                ? [{ uri: resolveAssetUrl(data.thumbnailUrl) }]
                : []),
              // Copy before sort — `data` is the live React Query cache entry,
              // mutating it in place would corrupt the cache.
              ...[...data.images]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .filter((img) => !!img.imageUrl)
                .map((img) => ({ uri: img.imageUrl })),
            ],
          }
        : null;

      const recommendation = data?.recommendation
        ? {
            id: data.recommendation.id,
            name: data.recommendation.name,
            slug: data.recommendation.slug,
            manufacturer:
              typeof data.recommendation.manufacturer === "string"
                ? data.recommendation.manufacturer
                : (data.recommendation.manufacturer?.name ??
                  data.recommendation.brand?.name ??
                  ""),
            packSize: data.recommendation.packSize,
            unit: data.recommendation.unit,
            description: [
              data.recommendation.packSize?.trim(),
              data.recommendation.unit,
              "in",
              data.recommendation.dosageForm,
            ]
              .filter(Boolean)
              .join(" "),
            // Raw API strings for display
            priceDisplay: data.recommendation.price,
            mrpDisplay: data.recommendation.mrp ?? data.recommendation.price,
            // Numbers for calculations
            price: parseFloat(data.recommendation.price) || 0,
            originalPrice: data.recommendation.mrp
              ? parseFloat(data.recommendation.mrp)
              : parseFloat(data.recommendation.price) || 0,
            savingsPercent: data.recommendation.discountPercentage || 0,
            image: data.recommendation.thumbnailUrl
              ? { uri: resolveAssetUrl(data.recommendation.thumbnailUrl) }
              : undefined,
            productId: data.recommendation.productId,
          }
        : null;

      const saltComposition = data?.salts.length
        ? data.salts.map((s) => `${s.name} ${s.amount}${s.unit}`).join(" + ")
        : null;

      const variants: MedicineVariant[] =
        data?.medicine_variants?.filter((v) => v.status === 1) ?? [];

      return { product, recommendation, saltComposition, variants };
    }, [data]);

  return {
    product,
    recommendation,
    saltComposition,
    variants,
    raw: data,
    isLoading,
    error,
  };
};
