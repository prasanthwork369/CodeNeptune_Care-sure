import { apiClient } from "@/src/api/client";
import { API_ENDPOINTS } from "@/src/utils/urls";
import type { CreateCallbackRequestPayload } from "../types/api.types";

export const prescriptionCallbackApi = {
  /** Queues a pharmacist call-back for the staff dashboards. */
  create: async (payload: CreateCallbackRequestPayload): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.PRESCRIPTION_CALLBACK_REQUESTS, payload);
  },
};
