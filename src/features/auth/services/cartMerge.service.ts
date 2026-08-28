import { cartApi } from "@/src/features/cart/api/cart.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useCartPendingStore } from "@/src/store/cartStore";
import { QueryClient } from "@tanstack/react-query";

/**
 * Merges local guest cart items into the user's backend cart sequentially after login.
 */
export async function mergeGuestCartItems(queryClient: QueryClient): Promise<void> {
  const guestCart = useCartPendingStore.getState().guestCart;
  if (!guestCart || guestCart.items.length === 0) return;

  let anyMerged = false;
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

  if (anyMerged) {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.CUSTOMER.CART,
    });
  }
}
