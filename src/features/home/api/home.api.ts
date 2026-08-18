import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type { ApiAppContent } from "../types/api.types";

export const homeApi = {
  getAppContents: async (): Promise<ApiAppContent> => {
    const response = await apiClient.get(API_ENDPOINTS.APP_CONTENTS);
    return response.data.data;
  },
};
