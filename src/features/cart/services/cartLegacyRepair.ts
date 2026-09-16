import { QueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart.api";
import { medicineApi } from "@/src/features/product/api/medicine.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { newIdempotencyKey } from "@/src/utils/idempotencyKey";
import { logger } from "@/src/utils/logger";
import type { Cart, CartItem } from "../types";

/**
 * Heals cart rows written before the variant-id fix.
 *
 * Builds up to that fix stored the `medicine_variants.id` in the row's
 * `medicineId`. Catalog (`/medicines/bulk`) and pricing (`medicine_stock`)
 * are both keyed to `medicines.id` by foreign key, so order-service can
 * resolve neither for such a row and rejects the whole order at Place Order
 * ("Unable to verify the current price for: <uuid>"). Shipping the fix alone
 * stops new bad rows but leaves anyone mid-cart permanently unable to check
 * out, so those rows have to be rewritten once.
 *
 * Detection is exact rather than heuristic: only the old code produced a row
 * whose `medicineId` equals its own `metadata.selectedVariantId`, because it
 * wrote the variant UUID into both. A correctly-written row can never match —
 * its medicineId comes from `medicines` and its selectedVariantId from
 * `medicine_variants`, which are different tables with different keys.
 */
function isLegacyVariantRow(item: CartItem): boolean {
  const variantId = item.metadata?.selectedVariantId;
  return !!variantId && item.medicineId === variantId;
}

/**
 * Rewrites one row: add the corrected line first, then drop the broken one.
 *
 * Deliberately add-then-remove. If the add fails the customer still has their
 * original (unbuyable, but present) line and we simply leave it for the next
 * attempt; removing first would risk losing the item outright when the add
 * then fails. The transient worst case is a visible duplicate, which the
 * customer can delete — strictly better than silent data loss.
 */
async function repairRow(item: CartItem): Promise<boolean> {
  // Catalog code (e.g. "CS-BDSMYG") the old client stored alongside the row.
  // It is the only handle back to the parent medicine, since the row's own
  // medicineId resolves to nothing server-side.
  const catalogId = item.metadata?.productId;
  if (!catalogId) return false;

  const product = await medicineApi.getProductByCatalogId(catalogId);
  const parentMedicineId = product?.id;
  // A parent that still equals the variant id would just rewrite the same
  // broken row, so treat it as unresolvable and leave the row untouched.
  if (!parentMedicineId || parentMedicineId === item.medicineId) return false;

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
      // Carried over as-is so the variant selection, pack label and any other
      // display metadata survive the rewrite.
      metadata: item.metadata,
    },
    newIdempotencyKey(),
  );

  await cartApi.removeItem(item.id);
  return true;
}

/**
 * Repairs every legacy row in the current cart, then refreshes it once.
 *
 * Returns the number of rows rewritten. Never throws: a cart that cannot be
 * repaired is left exactly as it was, which is no worse than before this ran.
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
      // Per-row catch: one unresolvable product must not stop the rest.
      if (__DEV__) {
        logger.debug(
          "[CartRepair] Could not repair row, leaving it in place:",
          item.id,
          err,
        );
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
