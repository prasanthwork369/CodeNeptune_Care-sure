import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type { SubstituteRequestResponse } from "../types/api.types";

export const substituteApi = {
  /**
   * Submits a substitute request for a medicine when no alternative exists.
   */
  async createRequest(medicineId: string): Promise<SubstituteRequestResponse> {
    const response = await apiClient.post<SubstituteRequestResponse>(
      API_ENDPOINTS.SUBSTITUTE_REQUESTS,
      { medicineId },
    );
    return response.data;
  },
};
