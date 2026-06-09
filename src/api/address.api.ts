import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';

export interface Address {
    id: string;
    label: string;
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    createdAt: string;
}

export interface CreateAddressPayload {
    label: string;
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    isDefault?: boolean;
}

export interface UpdateAddressPayload {
    id: string;
    label?: string;
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    isDefault?: boolean;
}

export const addressApi = {
    getAddresses: async (): Promise<Address[]> => {
        const response = await apiClient.get(API_ENDPOINTS.CUSTOMER_ADDRESSES);
        return response.data.data;
    },
    addAddress: async (payload: CreateAddressPayload): Promise<Address> => {
        const response = await apiClient.post(API_ENDPOINTS.CUSTOMER_ADDRESSES, payload);
        return response.data.data;
    },
    updateAddress: async (payload: UpdateAddressPayload): Promise<void> => {
        const { id, ...rest } = payload;
        await apiClient.patch(API_ENDPOINTS.CUSTOMER_ADDRESS_BY_ID(id), rest);
    },
    deleteAddress: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.CUSTOMER_ADDRESS_BY_ID(id));
    },
};
