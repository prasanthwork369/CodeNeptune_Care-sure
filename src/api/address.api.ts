import { API_ENDPOINTS } from '../utils/urls';
import { sanitizeAsciiFields } from '../utils/validation';
import { apiClient } from './client';

// iOS paste and dictation bypass the Android input filter, so strip here before the payload leaves.
const ADDRESS_TEXT_FIELDS = ['label', 'name', 'line1', 'line2', 'city', 'state'] as const;

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
        const response = await apiClient.post(
            API_ENDPOINTS.CUSTOMER_ADDRESSES,
            sanitizeAsciiFields(payload, ADDRESS_TEXT_FIELDS),
        );
        return response.data.data;
    },
    updateAddress: async (payload: UpdateAddressPayload): Promise<void> => {
        const { id, ...rest } = sanitizeAsciiFields(payload, ADDRESS_TEXT_FIELDS);
        await apiClient.patch(API_ENDPOINTS.CUSTOMER_ADDRESS_BY_ID(id), rest);
    },
    deleteAddress: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.CUSTOMER_ADDRESS_BY_ID(id));
    },
};
