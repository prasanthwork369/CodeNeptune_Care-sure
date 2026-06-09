import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';
import { Cart, AddToCartInput, UpdateCartItemInput, CheckoutInput } from '../types/cart';

export const cartApi = {
    getCart: async (): Promise<Cart> => {
        const response = await apiClient.get(API_ENDPOINTS.CART);
        return response.data.data;
    },

    addItem: async (input: AddToCartInput): Promise<Cart> => {
        const response = await apiClient.post(API_ENDPOINTS.CART_ITEMS, input);
        return response.data.data;
    },

    updateItem: async (itemId: string, input: UpdateCartItemInput): Promise<Cart> => {
        const response = await apiClient.patch(API_ENDPOINTS.CART_ITEM_BY_ID(itemId), input);
        return response.data.data;
    },

    removeItem: async (itemId: string): Promise<Cart> => {
        const response = await apiClient.delete(API_ENDPOINTS.CART_ITEM_BY_ID(itemId));
        return response.data.data;
    },

    clearCart: async (): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.CART);
    },

    checkout: async (input: CheckoutInput): Promise<any> => {
        const response = await apiClient.post(API_ENDPOINTS.CART_CHECKOUT, input);
        return response.data.data;
    },
};
