import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type { Address } from "@/src/types/address";
import type {
  CreateAddressPayload,
  UpdateAddressPayload,
} from "../types/api.types";

export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMER_ADDRESSES);
    return response.data.data;
  },
  addAddress: async (payload: CreateAddressPayload): Promise<Address> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CUSTOMER_ADDRESSES,
      payload,
    );
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
