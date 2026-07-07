import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";

export const authApi = {
  requestOtp: async (phone: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_REQUEST_OTP, {
      phone,
    });
    return response.data;
  },
  verifyOtp: async (phone: string, otp: string, deviceId: string | null) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_VERIFY_OTP, {
      phone,
      otp,
      deviceId: deviceId ?? "", // Fallback to empty string if somehow null, keeping it a valid string type
    });
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
    return response.data;
  },
};
