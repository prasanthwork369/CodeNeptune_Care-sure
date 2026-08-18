import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type { HealthProblem } from "../types/api.types";

export const healthProblemApi = {
  list: async (params?: {
    isActive?: boolean;
    search?: string;
  }): Promise<HealthProblem[]> => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: HealthProblem[];
    }>(API_ENDPOINTS.HEALTH_PROBLEMS, { params });
    return data.data;
  },
};
