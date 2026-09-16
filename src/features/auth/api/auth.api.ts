import { apiClient } from "@/src/api/client";
import { API_ENDPOINTS } from "@/src/utils/urls";

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
      // Omitted when unresolvable, never sent as "". The field is
      // `z.string().min(1).optional()` server-side, so an empty string fails
      // validation and 422s the whole login; optional means absent.
      ...(deviceId ? { deviceId } : {}),
      platform: "APP", // Distinguishes the mobile app from the web panel (backend-required)
    });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
    return response.data;
  },
};
