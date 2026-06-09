import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';

export interface DeviceInfo {
    token: string;
    platform: 'ios' | 'android';
    deviceName: string | null;
    deviceModel: string | null;
    osVersion: string | null;
    appVersion: string | null;
}

export const notificationApi = {
    registerToken: async (info: DeviceInfo) => {
        const response = await apiClient.post(API_ENDPOINTS.PUSH_TOKEN, info);
        return response.data;
    },
    removeToken: async (token: string) => {
        const response = await apiClient.delete(API_ENDPOINTS.PUSH_TOKEN, { data: { token } });
        return response.data;
    },
};
