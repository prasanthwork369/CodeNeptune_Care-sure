import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type {
  CreateReturnRequest,
  ReturnRecord,
} from "../types/api.types";

export const returnApi = {
  createReturn: async (data: CreateReturnRequest): Promise<ReturnRecord> => {
    // Cap reason and details fields at 1000 chars to prevent API validation failures
    const sanitizedData: CreateReturnRequest = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        reason: item.reason?.slice(0, 1000) || "",
        details: item.details?.slice(0, 1000),
      })),
    };
    const response = await apiClient.post(API_ENDPOINTS.RETURNS, sanitizedData);
    return response.data.data;
  },

  getReturnById: async (id: string): Promise<ReturnRecord> => {
    const response = await apiClient.get(API_ENDPOINTS.RETURN_BY_ID(id));
    return response.data.data;
  },

  listReturns: async (
    params?: Record<string, unknown>,
  ): Promise<ReturnRecord[]> => {
    const response = await apiClient.get(API_ENDPOINTS.RETURNS, { params });
    return response.data.data;
  },

  // Backend allows this only while the return is REQUESTED or APPROVED
  // (assertCancellable); `reason` is optional and capped at 1000 chars.
  cancelReturn: async (id: string, reason?: string): Promise<ReturnRecord> => {
    const response = await apiClient.post(API_ENDPOINTS.RETURN_CANCEL(id), {
      reason: reason?.slice(0, 1000),
    });
    return response.data.data;
  },
};
