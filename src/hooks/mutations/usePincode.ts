import { asError } from "@/src/api/errors";
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
    } catch (e) {
      if (__DEV__)
        console.error(
          "[usePincode] checkServiceability error:",
          asError(e).response?.status,
          asError(e).response?.data,
          asError(e).message,
        );
      throw e;
    } finally {
      setIsChecking(false);
    }
  };

  return { checkServiceability, isChecking };
};
