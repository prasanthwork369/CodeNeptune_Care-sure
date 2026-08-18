import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import { asError } from "@/src/api/errors";
import { logger } from "@/src/utils/logger";
import type { PincodeCheckResponse } from "../types/api.types";

export const pincodeApi = {
  check: async (pincode: string): Promise<PincodeCheckResponse> => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PINCODE_CHECK(pincode));
      if (__DEV__)
        logger.debug("[pincodeApi] check response:", JSON.stringify(res.data));
      return res.data?.data ?? res.data;
    } catch (e) {
      // Backend returns non-2xx for non-serviceable pincodes.
      // If the error body still contains serviceability info, return it normally.
      const body = asError(e).response?.data;
      const errPayload = (body?.data ?? body) as
        Partial<PincodeCheckResponse> | undefined;
      if (__DEV__)
        logger.debug(
          "[pincodeApi] check error payload:",
          JSON.stringify(errPayload),
        );
      if (errPayload && typeof errPayload.serviceable === "boolean") {
        return errPayload as PincodeCheckResponse;
      }
      throw e;
    }
  },
};
