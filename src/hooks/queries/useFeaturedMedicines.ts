import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { medicineApi } from "../../api/medicine.api";
import type { Product } from "../../types/home";
import { formatPackLabel } from "../../utils/packLabel";
import { resolveAssetUrl } from "../../utils/urls";
import { apiCache, withSqliteCache } from "@/src/lib/sqlite/cache";

export const useFeaturedMedicines = () => {
  const cachedMed = apiCache.getWithMeta<any[]>('featured_medicines');

  const {
    data: medicines = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.CATALOG.FEATURED_MEDICINES,
    queryFn: withSqliteCache('featured_medicines', medicineApi.getFeaturedCards),
    initialData: () => cachedMed?.data,
    initialDataUpdatedAt: () => cachedMed?.updatedAt ?? 0,
    staleTime: 5 * 60_000,
    refetchInterval: 2 * 60 * 1000,
  });

  const products: Product[] = medicines.map((med) => {
    const price = parseFloat(med.price);
    const discountPct = parseFloat(med.discountPercentage);
    const originalPrice =
      discountPct > 0
        ? parseFloat((price / (1 - discountPct / 100)).toFixed(2))
        : undefined;
    const packLabel = formatPackLabel({ packSize: med.packSize, unit: med.unit, dosageForm: med.dosageForm });

    // Default variant (variant[0]) for add-to-cart only — display stays on the
    // base price above. Mirrors the mobile PDP: variant.price is the MRP and the
    // discount is the variant's own %, falling back to the medicine-level % when 0.
    const dv = med.medicine_variants?.[0];
    const defaultVariant = dv
      ? (() => {
          const vDiscount =
            Number(dv.discountPercentage) > 0
              ? Number(dv.discountPercentage)
              : discountPct || 0;
          const vMrp = Number(dv.price);
          return {
            id: dv.id,
            mrp: vMrp,
            sellingPrice:
              vDiscount > 0
                ? parseFloat((vMrp * (1 - vDiscount / 100)).toFixed(2))
                : vMrp,
            discountPercent: vDiscount,
            packSize: dv.packSize,
            unit: dv.unit,
          };
        })()
      : undefined;

    return {
      id: med.id,
      productId: med.productId,
      slug: med.slug,
      name: med.name,
      brand: med.brand?.name ?? "",
      pack: packLabel,
      description: packLabel || med.brand?.name || "",
      price,
      originalPrice,
      discount: discountPct > 0 ? `${discountPct}% OFF` : undefined,
      discountPercent: discountPct || 0,
      image: med.thumbnailUrl ? { uri: resolveAssetUrl(med.thumbnailUrl) } : null,
      requiresPrescription: med.requiresPrescription,
      defaultVariant,
    };
  });

  return { products, isLoading, error, refetch };
};
