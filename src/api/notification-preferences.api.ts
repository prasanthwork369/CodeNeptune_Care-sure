import { apiClient } from './client';
import { API_ENDPOINTS } from '../utils/urls';

export interface CustomerNotificationPreferences {
    id: string;
    customerId: string;
    orderUpdatesEnabled: boolean;
    healthUpdatesEnabled: boolean;
    promotionsOffersEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateNotificationPreferencesInput {
    orderUpdatesEnabled?: boolean;
    healthUpdatesEnabled?: boolean;
    promotionsOffersEnabled?: boolean;
}

export const notificationPreferencesApi = {
    getPreferences: async (): Promise<CustomerNotificationPreferences> => {
        const { data } = await apiClient.get(API_ENDPOINTS.CUSTOMER_NOTIFICATION_PREFERENCES);
        return data.data as CustomerNotificationPreferences;
    },
    updatePreferences: async (payload: UpdateNotificationPreferencesInput): Promise<CustomerNotificationPreferences> => {
        const { data } = await apiClient.patch(API_ENDPOINTS.CUSTOMER_NOTIFICATION_PREFERENCES, payload);
        return data.data as CustomerNotificationPreferences;
    },
};
