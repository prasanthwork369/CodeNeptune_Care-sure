import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type { ApiPrescriptionOrderItem } from "../types/api.types";

export const prescriptionOrderApi = {
  getMedicines: async (
    orderId: string,
  ): Promise<ApiPrescriptionOrderItem[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.PRESCRIPTION_ORDER_MEDICINES(orderId),
    );
    const raw = response.data?.data;
    if (Array.isArray(raw?.comparisonData)) return raw.comparisonData;
    if (Array.isArray(raw)) return raw;
    return [];
  },
};
