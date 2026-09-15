import { cartApi } from "@/src/features/cart/api/cart.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useCartPendingStore } from "@/src/store/cartStore";
import { QueryClient } from "@tanstack/react-query";

/**
 * Merges local guest cart items into the user's backend cart sequentially after login.
 *
 * `isMergingCart` brackets the whole loop so the cart socket handler and the
 * cart read queries pause while it's on (see useCartSocketSync, useCart,
 * useCartRead, useCartActions) — otherwise each item's server response/socket
 * push would land on screen individually, and the badge would count up
 * 1-by-1 instead of jumping straight to the final total once this resolves.
 */
export async function mergeGuestCartItems(queryClient: QueryClient): Promise<void> {
  const guestCart = useCartPendingStore.getState().guestCart;
  if (!guestCart || guestCart.items.length === 0) return;

  useCartPendingStore.getState().setMergingCart(true);
  let anyMerged = false;
  try {
    for (const item of guestCart.items) {
      try {
        await cartApi.addItem({
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
        });
        // Remove only items that successfully merge; failed items remain for retry.
        useCartPendingStore.getState().removeGuestItem(item.id);
        anyMerged = true;
      } catch (err) {
        if (__DEV__) {
          console.warn("[CartMerge] Failed to merge item:", item.medicineId, err);
        }
      }
    }
  } finally {
    // Runs whether the loop finished cleanly or not, so a merge can never
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
