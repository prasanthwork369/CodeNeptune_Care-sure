import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { cartApi } from "@/src/features/cart/api/cart.api";
import { useAuthStore } from "@/src/store/authStore";
import { useCartPendingStore } from "@/src/store/cartStore";
import type { CartItem } from "@/src/features/cart/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

// Shared identity, or an empty cart would hand useMemo a new array each render.
const EMPTY_ITEMS: CartItem[] = [];

/**
 * Read-only view of the cart, for components that never mutate it.
 *
 * useCart builds five useMutation instances per call, which product cards pay
 * for on mount and on every cart write. This hook holds only the query
 * subscription, so a card costs one subscriber instead of six.
 */
export const useCartRead = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestCart = useCartPendingStore((s) => s.guestCart);

  const { data: cart, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.CART,
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    // Mutations keep this cache fresh via setQueryData, so a short staleTime
    // just avoids redundant refetches on every screen focus/tab switch.
    staleTime: 10_000,
  });

  const activeCart = isAuthenticated ? cart : guestCart;
  const items: CartItem[] = activeCart?.items ?? EMPTY_ITEMS;

  // One pass over the items instead of two reduces per subscribed card.
  const { totalItems, totalPrice } = useMemo(() => {
    let count = 0;
    let price = 0;
    for (const item of items) {
      count += item.quantity;
      const mrp = parseFloat(String(item.unitPrice));
      const discountPct =
        item.discountPercent ?? item.metadata?.discountPercent ?? 0;
      price +=
        (discountPct > 0 ? mrp * (1 - discountPct / 100) : mrp) * item.quantity;
    }
    return { totalItems: count, totalPrice: price };
  }, [items]);

  return {
    cart: activeCart,
    items,
    totalItems,
    totalPrice,
    isLoading: isAuthenticated ? isLoading : false,
  };
};

/**
 * Selects only the total item count from the cart for header badge display.
 */
export const useCartCount = (): number => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: authCount } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.CART,
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 10_000,
    select: (cart) => {
      let count = 0;
      for (const item of cart?.items ?? []) {
        count += item.quantity;
      }
      return count;
    },
  });

  const guestCount = useCartPendingStore((s) => {
    if (isAuthenticated) return 0;
    let count = 0;
    for (const item of s.guestCart.items) {
      count += item.quantity;
    }
    return count;
  });

  return (isAuthenticated ? authCount : guestCount) ?? 0;
};

/**
 * Selects only the matching variant ID from cart for variant preselection.
 * Returns a primitive string, preventing parent re-renders on cart quantity changes.
 */
export const useInCartVariantId = (
  variants: { id: string; packSize?: string; unit?: string }[],
): string | undefined => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: authVariantId } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.CART,
    queryFn: cartApi.getCart,
    enabled: isAuthenticated && variants.length > 0,
    staleTime: 10_000,
    select: (cart) => {
      if (!cart?.items?.length) return undefined;
      const inCart = variants.find((v) =>
        cart.items.some(
          (i) =>
            i.medicineId === v.id ||
            (i.metadata?.packSize === v.packSize &&
              i.metadata?.unit === v.unit),
        ),
      );
      return inCart?.id;
    },
  });

  const guestVariantId = useCartPendingStore((s) => {
    if (isAuthenticated || variants.length === 0) return undefined;
    const inCart = variants.find((v) =>
      s.guestCart.items.some(
        (i) =>
          i.medicineId === v.id ||
          (i.metadata?.packSize === v.packSize &&
            i.metadata?.unit === v.unit),
      ),
    );
    return inCart?.id;
  });

  return isAuthenticated ? authVariantId : guestVariantId;
};
