import { cartApi } from "@/src/features/cart/api/cart.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useCartPendingStore } from "@/src/store/cartStore";
import type { CartItem } from "@/src/features/cart/types";
import { QueryClient } from "@tanstack/react-query";
import { newIdempotencyKey } from "@/src/utils/idempotencyKey";

// Zod-enforced server-side ceiling on POST /cart/items/bulk (see
// order-service cart.validator.ts's bulkAddToCartSchema).
const BULK_CHUNK_SIZE = 50;

/**
 * Bulk-add (order-service BulkAddItemsUseCase) dedups purely on medicineId
 * and always writes an empty metadata column with prescriptionId forced to
 * null — it has no field to carry a variant selection or a prescription
 * link. An item with either would silently lose its variant identity (two
 * different variants sharing one medicineId would collapse into one row)
 * or its prescription attachment if merged this way, so those stay on the
 * metadata-aware single-item endpoint.
 */
function isBulkEligible(item: CartItem): boolean {
  const variantId = item.metadata?.selectedVariantId ?? item.metadata?.variantId;
  return !variantId && !item.prescriptionId;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

// Same fallback the sequential path already sends as `mrp` — the bulk
// endpoint's `mrp` field is a required-positive optional (Zod
// `.positive().optional()`), so 0/NaN must be omitted rather than sent.
function resolveMrp(item: CartItem): number | undefined {
  const mrp = Number(item.metadata?.price || item.originalPrice || item.unitPrice);
  return mrp > 0 ? mrp : undefined;
}

/** Bulk-merges the metadata-free subset, chunked to the server's 50-item cap. */
async function mergeBulkEligibleItems(items: CartItem[]): Promise<boolean> {
  let anyMerged = false;
  for (const batch of chunk(items, BULK_CHUNK_SIZE)) {
    try {
      const result = await cartApi.bulkAddItems(
        batch.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          mrp: resolveMrp(item),
        })),
        newIdempotencyKey(),
      );
      // `added` lists every item that got a row (new, merged, or
      // quantity-capped) — the only items never in it are cart_full/
      // not_found, which is exactly what should remain for retry.
      const addedIds = new Set(result.added.map((a) => a.medicineId));
      for (const item of batch) {
        if (addedIds.has(item.medicineId)) {
          useCartPendingStore.getState().removeGuestItem(item.id);
          anyMerged = true;
        }
      }
    } catch (err) {
      // Whole batch fails closed — every item in it stays in the guest
      // cart for retry, same fail-safe contract as the per-item catch below.
      if (__DEV__) {
        console.warn(
          "[CartMerge] Bulk batch failed, items remain for retry:",
          batch.map((i) => i.medicineId),
          err,
        );
      }
    }
  }
  return anyMerged;
}

/** Existing per-item merge for anything bulk can't safely carry (variants, prescription items). */
async function mergeSequentialItems(items: CartItem[]): Promise<boolean> {
  let anyMerged = false;
  for (const item of items) {
    try {
      await cartApi.addItem(
        {
          medicineId: item.medicineId,
          variantId: item.metadata?.selectedVariantId || null,
          medicineName: item.medicineName,
          medicineSlug: item.medicineSlug,
          unitPrice: Number(item.unitPrice),
          mrp: Number(
            item.metadata?.price || item.originalPrice || item.unitPrice,
          ),
          discountPercent: Number(item.discountPercent || 0),
          quantity: item.quantity,
          requiresPrescription: item.requiresPrescription,
          image: item.image,
          metadata: item.metadata,
        },
        newIdempotencyKey(),
      );
      // Remove only items that successfully merge; failed items remain for retry.
      useCartPendingStore.getState().removeGuestItem(item.id);
      anyMerged = true;
    } catch (err) {
      if (__DEV__) {
        console.warn("[CartMerge] Failed to merge item:", item.medicineId, err);
      }
    }
  }
  return anyMerged;
}

/**
 * Merges local guest cart items into the user's backend cart after login.
 * Items with no variant/prescription identity to preserve go through
 * POST /cart/items/bulk (chunked to 50/request, one server-side cart_update
 * for the whole batch); anything carrying a variant selection or a
 * prescription link keeps going through the single-item endpoint, which is
 * the only one that stores that metadata.
 *
 * `isMergingCart` brackets both phases so the cart socket handler and the
 * cart read queries pause while it's on (see useCartSocketSync, useCart,
 * useCartRead, useCartActions) — otherwise each request's server response/
 * socket push would land on screen individually, and the badge would count
 * up instead of jumping straight to the final total once this resolves.
 */
export async function mergeGuestCartItems(queryClient: QueryClient): Promise<void> {
  const guestCart = useCartPendingStore.getState().guestCart;
  if (!guestCart || guestCart.items.length === 0) return;

  const bulkEligible = guestCart.items.filter(isBulkEligible);
  const sequentialOnly = guestCart.items.filter((item) => !isBulkEligible(item));

  useCartPendingStore.getState().setMergingCart(true);
  let anyMerged = false;
  try {
    if (bulkEligible.length > 0) {
      const merged = await mergeBulkEligibleItems(bulkEligible);
      anyMerged = anyMerged || merged;
    }
    if (sequentialOnly.length > 0) {
      const merged = await mergeSequentialItems(sequentialOnly);
      anyMerged = anyMerged || merged;
    }
  } finally {
    // Runs whether both phases finished cleanly or not, so a merge can never
    // leave reads/socket updates paused for the rest of the session.
    useCartPendingStore.getState().setMergingCart(false);
  }

  if (anyMerged) {
    // Now that isMergingCart is back off, this actually triggers the single
    // refetch that lands the badge on its final count.
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.CUSTOMER.CART,
    });
  }
}
