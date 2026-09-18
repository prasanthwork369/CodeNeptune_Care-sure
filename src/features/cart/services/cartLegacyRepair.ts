import { QueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart.api";
import { medicineApi } from "@/src/features/product/api/medicine.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { newIdempotencyKey } from "@/src/utils/idempotencyKey";
import { logger } from "@/src/utils/logger";
import type { Cart, CartItem } from "../types";

// Only the old code wrote the variant UUID into both fields, so this signature
// is exact — a correct row's two ids come from different tables.
function isLegacyVariantRow(item: CartItem): boolean {
  const variantId = item.metadata?.selectedVariantId;
  return !!variantId && item.medicineId === variantId;
}

/** Rewrites one row with the parent medicineId. */
async function repairRow(item: CartItem): Promise<boolean> {
  // The row's own medicineId resolves to nothing server-side, so the catalog
  // code stored by the old client is the only handle back to the parent.
  const catalogId = item.metadata?.productId;
  if (!catalogId) return false;

  const product = await medicineApi.getProductByCatalogId(catalogId);
  const parentMedicineId = product?.id;
  // Same id back would just rewrite the same broken row.
  if (!parentMedicineId || parentMedicineId === item.medicineId) return false;

  // Add before remove: a failed add leaves the item in place instead of
  // deleting it into a failure.
  await cartApi.addItem(
    {
      medicineId: parentMedicineId,
      variantId: item.metadata?.selectedVariantId ?? null,
      medicineName: item.medicineName,
      medicineSlug: item.medicineSlug || product.slug || parentMedicineId,
      unitPrice: Number(item.unitPrice),
      mrp: Number(item.metadata?.price || item.originalPrice || item.unitPrice),
      discountPercent: Number(item.discountPercent || 0),
      quantity: item.quantity,
      requiresPrescription: item.requiresPrescription,
      image: item.image,
      metadata: item.metadata,
    },
    newIdempotencyKey(),
  );

  await cartApi.removeItem(item.id);
  return true;
}

/**
 * Heals cart rows written before the variant-id fix — they hold a variant UUID
 * in medicineId, which order-service can't price, so checkout rejects them.
 * Never throws: an unrepairable cart is left exactly as it was.
 */
export async function repairLegacyVariantCartRows(
  queryClient: QueryClient,
  cart: Cart | undefined,
): Promise<number> {
  const legacyRows = cart?.items?.filter(isLegacyVariantRow) ?? [];
  if (legacyRows.length === 0) return 0;

  let repaired = 0;
  for (const item of legacyRows) {
    try {
      if (await repairRow(item)) repaired += 1;
    } catch (err) {
      // One unresolvable product must not stop the rest.
      if (__DEV__) {
        logger.debug("[CartRepair] Row left in place:", item.id, err);
      }
    }
  }

  if (repaired > 0) {
    if (__DEV__)
      logger.debug(`[CartRepair] Rewrote ${repaired} legacy variant row(s)`);
    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.CUSTOMER.CART,
    });
  }
  return repaired;
}

export const __testing = { isLegacyVariantRow };
