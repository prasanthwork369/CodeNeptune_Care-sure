import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type {
  ApiFeaturedMedicine,
  ApiProductDetail,
} from "../types/api.types";

export const medicineApi = {
  // The endpoint only takes `limit` — it has no paging, so a full listing just
  // asks for a larger page. Signature matches the web client.
  getFeaturedCards: async (limit = 10): Promise<ApiFeaturedMedicine[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.MEDICINES_FEATURED_CARDS,
      {
        params: { limit },
      },
    );
    return response.data?.data ?? [];
  },
  getProductById: async (productId: string): Promise<ApiProductDetail> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.PRODUCT_BY_ID(productId),
      );
      return response.data.data;
    } catch {
      const response = await apiClient.get(`/api/v1/medicines/${productId}`);
      return response.data.data;
    }
  },
  getProductByCatalogId: async (
    catalogId: string,
  ): Promise<ApiProductDetail> => {
    // catalogId is the alphanumeric productId (e.g. "CS-BDSMYG"), not the UUID id field
    const response = await apiClient.get(
      API_ENDPOINTS.PRODUCT_BY_ID(catalogId),
    );
    return response.data.data;
  },
};
