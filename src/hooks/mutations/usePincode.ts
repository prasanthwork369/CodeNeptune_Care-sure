import { useState } from "react";
import { pincodeApi, PincodeCheckResponse } from "@/src/api/pincode.api";

export const usePincode = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkServiceability = async (
    pincode: string,
  ): Promise<PincodeCheckResponse> => {
    setIsChecking(true);
    try {
      return await pincodeApi.check(pincode);
    } catch (e: any) {
      if (__DEV__)
        console.error(
          "[usePincode] checkServiceability error:",
          e?.response?.status,
          e?.response?.data,
          e?.message,
        );
      throw e;
    } finally {
      setIsChecking(false);
    }
  };

  return { checkServiceability, isChecking };
};
