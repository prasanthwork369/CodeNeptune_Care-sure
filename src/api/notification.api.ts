import { Platform } from 'react-native';
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
    /** Registers/upserts this device's token. Works before login (recipientId stays null). */
    registerDevice: async (token: string, deviceId: string | null) => {
        const response = await apiClient.post(API_ENDPOINTS.PUSH_DEVICE_REGISTER, {
            token,
            platform: Platform.OS,
            ...(deviceId ? { deviceId } : {}),
        });
        return response.data;
    },
    /** Attaches an already-registered token to the logged-in user. */
    claimToken: async (token: string) => {
        const response = await apiClient.post(API_ENDPOINTS.PUSH_DEVICE_CLAIM, { token });
        return response.data;
    },
    removeToken: async (token: string) => {
        const response = await apiClient.delete(API_ENDPOINTS.PUSH_DEVICE_BY_TOKEN(token));
        return response.data;
    },
};
