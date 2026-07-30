import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";

export interface PincodeArea {
  id: string;
  pincodeNumber: string;
  city: string;
  country: string;
  status: number;
}

export interface PincodeCheckResponse {
  serviceable: boolean;
  area?: PincodeArea;
}

export const pincodeApi = {
  check: async (pincode: string): Promise<PincodeCheckResponse> => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PINCODE_CHECK(pincode));
      if (__DEV__)
        console.log("[pincodeApi] check response:", JSON.stringify(res.data));
      return res.data?.data ?? res.data;
    } catch (e: any) {
      // Backend returns non-2xx for non-serviceable pincodes.
      // If the error body still contains serviceability info, return it normally.
      const errPayload = e?.response?.data?.data ?? e?.response?.data;
      if (__DEV__)
        console.log(
          "[pincodeApi] check error payload:",
          JSON.stringify(errPayload),
        );
      if (errPayload && typeof errPayload.serviceable === "boolean") {
        return errPayload;
      }
      throw e;
    }
  },
};
