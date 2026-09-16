import { API_ENDPOINTS } from "@/src/utils/urls";
import { DeviceInfo } from "@/src/lib/deviceInfo";
import { apiClient } from "@/src/api/client";
import { logger } from "@/src/utils/logger";

/** Drops null/undefined entries, keeping falsy-but-valid values like false/0. */
export function omitNullish<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value != null),
  ) as Partial<T>;
}

export const notificationApi = {
  /**
   * Registers/upserts this device's token along with the full device info.
   * Works before and after login. `platform` is derived from `device_os`.
   */
  registerDevice: async (token: string, deviceInfo: DeviceInfo) => {
    // Every telemetry field is `z.string().optional()` (or a number union)
    // server-side, and expo returns null for several of them on some devices —
    // brand, osName, androidId, buildNumber. A null fails those schemas and
    // 422s the whole registration, costing that device its push token, so
    // null/undefined entries are dropped rather than sent. `false` and `0` are
    // legitimate values and must survive.
    const payload = {
      token,
      ...omitNullish(deviceInfo),
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
