import { CreateReturnRequest, ReturnRecord } from "../types/return";
import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";

export const returnApi = {
  createReturn: async (data: CreateReturnRequest): Promise<ReturnRecord> => {
    const response = await apiClient.post(API_ENDPOINTS.RETURNS, data);
    return response.data.data;
  },

  getReturnById: async (id: string): Promise<ReturnRecord> => {
    const response = await apiClient.get(API_ENDPOINTS.RETURN_BY_ID(id));
    return response.data.data;
  },

  listReturns: async (
    params?: Record<string, any>,
  ): Promise<ReturnRecord[]> => {
    const response = await apiClient.get(API_ENDPOINTS.RETURNS, { params });
    return response.data.data;
  },
};
