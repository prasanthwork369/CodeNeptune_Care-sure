/**
 * Zustand selectors to prevent unnecessary re-renders.
 *
 * Instead of:
 *   const store = useCartStore(); // Re-renders on ANY store change
 *
 * Use:
 *   const items = useCartStore(selectCartItems); // Only re-renders if items change
 */

import { useCartPendingStore } from "./cartStore";
import { useAuthStore } from "./authStore";
import { useCheckoutStore } from "./checkoutStore";
import { useUIStore } from "./uiStore";
import { useCouponStore } from "./couponStore";
import { useLocationStore } from "./locationStore";

// ============================================================================
// CART STORE SELECTORS
// ============================================================================

export const selectCartItems = (state: ReturnType<typeof useCartPendingStore.getState>) =>
  state.guestCart?.items ?? [];

export const selectCartItemCount = (state: ReturnType<typeof useCartPendingStore.getState>) =>
  (state.guestCart?.items ?? []).length;

export const selectCartTotalPrice = (state: ReturnType<typeof useCartPendingStore.getState>) => {
  const items = state.guestCart?.items ?? [];
  return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
};

export const selectCartServerData = (state: ReturnType<typeof useCartPendingStore.getState>) =>
  state.cart;

export const selectIsMergingCart = (state: ReturnType<typeof useCartPendingStore.getState>) =>
  state.isMergingCart;

export const selectPendingIds = (state: ReturnType<typeof useCartPendingStore.getState>) =>
  state.pendingIds;

export const selectIsPending = (itemId: string) =>
  (state: ReturnType<typeof useCartPendingStore.getState>) =>
    state.pendingIds[itemId] ?? false;

// ============================================================================
// AUTH STORE SELECTORS
// ============================================================================

export const selectUser = (state: ReturnType<typeof useAuthStore.getState>) =>
  state.user;

export const selectUserId = (state: ReturnType<typeof useAuthStore.getState>) =>
  state.user?.customerId ?? null;

export const selectIsLoggedIn = (state: ReturnType<typeof useAuthStore.getState>) =>
  !!state.user?.customerId;

export const selectAuthToken = (state: ReturnType<typeof useAuthStore.getState>) =>
  state.accessToken;

// ============================================================================
// CHECKOUT STORE SELECTORS
// ============================================================================

export const selectCheckoutAddress = (state: ReturnType<typeof useCheckoutStore.getState>) =>
  state.selectedAddress;

export const selectCheckoutPaymentMethod = (state: ReturnType<typeof useCheckoutStore.getState>) =>
  state.selectedPaymentMethod;

export const selectCheckoutPromoCode = (state: ReturnType<typeof useCheckoutStore.getState>) =>
  state.promoCode;

// ============================================================================
// UI STORE SELECTORS
// ============================================================================

export const selectIsModalOpen = (modalName: string) =>
  (state: ReturnType<typeof useUIStore.getState>) =>
    state.modals[modalName] ?? false;

export const selectIsLoading = (state: ReturnType<typeof useUIStore.getState>) =>
  state.isLoading;

// ============================================================================
// COUPON STORE SELECTORS
// ============================================================================

export const selectActiveCoupons = (state: ReturnType<typeof useCouponStore.getState>) =>
  state.activeCoupons ?? [];

export const selectSelectedCoupon = (state: ReturnType<typeof useCouponStore.getState>) =>
  state.selectedCoupon;

// ============================================================================
// LOCATION STORE SELECTORS
// ============================================================================

export const selectSelectedAddress = (state: ReturnType<typeof useLocationStore.getState>) =>
  state.selectedAddress;

export const selectUserAddresses = (state: ReturnType<typeof useLocationStore.getState>) =>
  state.addresses;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Cart item count badge
 *
 * ❌ BAD - Re-renders on ANY cart change (pending IDs, server cart, merge status)
 * function CartBadge() {
 *   const store = useCartPendingStore();
 *   return <Text>{store.guestCart.items.length}</Text>;
 * }
 *
 * ✓ GOOD - Only re-renders if item count actually changes
 * function CartBadge() {
 *   const count = useCartPendingStore(selectCartItemCount);
 *   return <Text>{count}</Text>;
 * }
 */

/**
 * EXAMPLE 2: Cart summary (price + item count)
 *
 * ❌ BAD
 * function CartSummary() {
 *   const { guestCart } = useCartPendingStore();
 *   // Recalculates and re-renders on ANY store change
 *   return <Text>{guestCart.items.length} items, ${...}</Text>;
 * }
 *
 * ✓ GOOD - Only re-renders if items or prices change
 * function CartSummary() {
 *   const count = useCartPendingStore(selectCartItemCount);
 *   const total = useCartPendingStore(selectCartTotalPrice);
 *   return <Text>{count} items, ${total}</Text>;
 * }
 */

/**
 * EXAMPLE 3: Checkout address display
 *
 * ❌ BAD - Re-renders on ANY checkout store change
 * function AddressDisplay() {
 *   const checkout = useCheckoutStore();
 *   return <Text>{checkout.selectedAddress?.street}</Text>;
 * }
 *
 * ✓ GOOD - Only re-renders if address changes
 * function AddressDisplay() {
 *   const address = useCheckoutStore(selectCheckoutAddress);
 *   return <Text>{address?.street}</Text>;
 * }
 */
