import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type {
  ApiSearchHistoryItem,
  ApiSearchResponse,
  ApiTrendingItem,
} from "../types/api.types";

export const searchApi = {
  searchMedicines: async (
    query: string,
    page = 1,
    limit = 10,
  ): Promise<ApiSearchResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH_MEDICINES, {
      params: { query, page, limit },
    });
    return response.data;
  },

  getSuggestions: async (query: string, limit = 8): Promise<string[]> => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH_SUGGESTIONS, {
      params: { query, limit },
    });
    return response.data?.data ?? [];
  },

  getHistory: async (
    limit = 10,
    offset = 0,
  ): Promise<ApiSearchHistoryItem[]> => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH_HISTORY, {
      params: { limit, offset },
    });
    return response.data?.data ?? [];
  },

  recordHistory: async (query: string, productId?: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.SEARCH_HISTORY, { query, productId });
  },

  clearHistory: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SEARCH_HISTORY);
  },

  deleteHistoryItem: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SEARCH_HISTORY_ITEM(id));
  },

  getTrending: async (limit = 6): Promise<ApiTrendingItem[]> => {
    const response = await apiClient.get(API_ENDPOINTS.SEARCH_TRENDING, {
      params: { limit },
    });
    return response.data?.data ?? [];
  },
};
