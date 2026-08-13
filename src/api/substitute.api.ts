import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";

export interface SubstituteRequestResponse {
  id: string;
  customerId: string;
  medicineId: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

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
