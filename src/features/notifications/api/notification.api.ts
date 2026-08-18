import { API_ENDPOINTS } from "@/src/utils/urls";
import { DeviceInfo } from "@/src/lib/deviceInfo";
import { apiClient } from "@/src/api/client";
import { logger } from "@/src/utils/logger";

export const notificationApi = {
  /**
   * Registers/upserts this device's token along with the full device info.
   * Works before and after login. `platform` is derived from `device_os`.
   */
  registerDevice: async (token: string, deviceInfo: DeviceInfo) => {
    const payload = {
      token,
      ...deviceInfo,
    };
    if (__DEV__)
      logger.debug(
        "[RegisterDevice] payload:",
        JSON.stringify(payload, null, 2),
      );
    const response = await apiClient.post(
      API_ENDPOINTS.PUSH_DEVICE_REGISTER,
      payload,
    );
    return response.data;
  },
  removeToken: async (token: string) => {
    const response = await apiClient.delete(
      API_ENDPOINTS.PUSH_DEVICE_BY_TOKEN(token),
    );
    return response.data;
  },
};
