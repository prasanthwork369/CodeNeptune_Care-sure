import { apiClient } from "@/src/api/client";
import { API_ENDPOINTS } from "@/src/utils/urls";
import type {
  CustomerNotificationPreferences,
  UpdateNotificationPreferencesInput,
} from "../types/api.types";

export const notificationPreferencesApi = {
  getPreferences: async (): Promise<CustomerNotificationPreferences> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.CUSTOMER_NOTIFICATION_PREFERENCES,
    );
    return data.data as CustomerNotificationPreferences;
  },
  updatePreferences: async (
    payload: UpdateNotificationPreferencesInput,
  ): Promise<CustomerNotificationPreferences> => {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.CUSTOMER_NOTIFICATION_PREFERENCES,
      payload,
    );
    return data.data as CustomerNotificationPreferences;
  },
};
