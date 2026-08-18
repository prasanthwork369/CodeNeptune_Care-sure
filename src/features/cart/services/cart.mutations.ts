import { queryClient } from "@/src/lib/react-query/queryClient";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "@/src/store/authStore";
import { useCartPendingStore } from "@/src/store/cartStore";
import type {
  AddToCartInput,
  Cart,
  UpdateCartItemInput,
} from "../types";
import { cartApi } from "../api/cart.api";

/**
 * Cart writes as plain functions rather than useMutation hooks.
 *
 * Product cards call these through useCartActions. A hook would allocate five
 * mutation objects per mounted card — with ~25 cards on Home that is 125
 * subscriptions rebuilt on every render, for callbacks that only ever write the
 * cart cache. Guest/authenticated branching matches useCart exactly.
 */
export const cartMutations = {
  async addItem(input: AddToCartInput): Promise<Cart> {
    if (!useAuthStore.getState().isAuthenticated) {
      return useCartPendingStore.getState().addGuestItem(input);
    }
    const cart = await cartApi.addItem(input);
    queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, cart);
    return cart;
  },

  async updateItem(itemId: string, input: UpdateCartItemInput): Promise<Cart> {
    if (!useAuthStore.getState().isAuthenticated) {
      return useCartPendingStore.getState().updateGuestItem(itemId, input);
    }
    const cart = await cartApi.updateItem(itemId, input);
    queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, cart);
    return cart;
  },

  async removeItem(itemId: string): Promise<Cart> {
    if (!useAuthStore.getState().isAuthenticated) {
      return useCartPendingStore.getState().removeGuestItem(itemId);
    }
    const cart = await cartApi.removeItem(itemId);
    queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, cart);
    return cart;
  },
};
