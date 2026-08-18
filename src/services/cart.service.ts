import { cartApi } from "../features/cart/api/cart.api";
import {
  AddToCartInput,
  UpdateCartItemInput,
  CheckoutInput,
} from "../features/cart/types";

export const cartService = {
  getCart: async () => {
    return await cartApi.getCart();
  },

  addItem: async (input: AddToCartInput) => {
    return await cartApi.addItem(input);
  },

  updateItem: async (itemId: string, input: UpdateCartItemInput) => {
    return await cartApi.updateItem(itemId, input);
  },

  removeItem: async (itemId: string) => {
    return await cartApi.removeItem(itemId);
  },

  clearCart: async () => {
    return await cartApi.clearCart();
  },

  checkout: async (input: CheckoutInput) => {
    return await cartApi.checkout(input);
  },
};
