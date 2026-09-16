import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type {
  Cart,
  AddToCartInput,
  BulkAddCartItemInput,
  BulkAddResult,
  UpdateCartItemInput,
  CheckoutInput,
} from "../types/api.types";

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get(API_ENDPOINTS.CART);
    return response.data.data;
  },

  // Backend dedupes on (cartId, idempotencyKey), so a replayed request is a
  // no-op instead of double-applying the quantity.
  addItem: async (
    input: AddToCartInput,
    idempotencyKey?: string,
  ): Promise<Cart> => {
    const response = await apiClient.post(API_ENDPOINTS.CART_ITEMS, {
      ...input,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    return response.data.data;
  },

  // Server resolves pricing/name/prescription-flag from the catalog by
  // medicineId alone — no metadata/variant/prescriptionId field exists on
  // this endpoint. Only call this for items that don't need those preserved.
  bulkAddItems: async (
    items: BulkAddCartItemInput[],
    idempotencyKey?: string,
  ): Promise<BulkAddResult> => {
    const response = await apiClient.post(API_ENDPOINTS.CART_ITEMS_BULK, {
      items,
      ...(idempotencyKey ? { idempotencyKey } : {}),
    });
    return response.data.data;
  },

  updateItem: async (
    itemId: string,
    input: UpdateCartItemInput,
  ): Promise<Cart> => {
    const response = await apiClient.patch(
      API_ENDPOINTS.CART_ITEM_BY_ID(itemId),
      input,
    );
    return response.data.data;
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete(
      API_ENDPOINTS.CART_ITEM_BY_ID(itemId),
    );
    return response.data.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CART);
  },

  // Response shape is not modelled yet — callers must narrow before using it.
  checkout: async (input: CheckoutInput): Promise<unknown> => {
    const response = await apiClient.post(API_ENDPOINTS.CART_CHECKOUT, input);
    return response.data.data;
  },
};
