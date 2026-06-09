import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';

export const authApi = {
    requestOtp: async (phone: string) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH_REQUEST_OTP, { phone });
        return response.data;
    },
    verifyOtp: async (phone: string, otp: string) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH_VERIFY_OTP, { phone, otp });
        return response.data;
    },
    logout: async () => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
        return response.data;
    },
};
