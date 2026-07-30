import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";

export interface HealthProblem {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

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
