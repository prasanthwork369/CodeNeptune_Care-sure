import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useNav } from "@/src/hooks/useNav";
import {
  getPhoneNumberHint,
  normalizeIndianPhone,
} from "@/src/modules/PhoneNumberHint";
import { sanitize, validate } from "@/src/utils/validation";
import { useRef, useState } from "react";
import { Keyboard } from "react-native";
import { useNetworkStore } from "@/src/store/useNetworkStore";

import { perfService } from "@/src/services/performance/perfService";

/**
 * Custom hook managing the business logic for the Login screen.
 * Handles phone number sanitization, validation, native SIM suggestions, and triggering OTP request mutations.
 */
export function useLogin() {
  const router = useNav();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { requestOtp, loading, error } = useAuth();
  
  // Guard ref to prevent showing the phone number hint picker multiple times concurrently
  const hintInProgress = useRef(false);

  /**
   * Sanitizes input to numeric only and performs real-time validation checks.
   */
  const handleChangeText = (text: string) => {
    const cleaned = sanitize.phone(text);
    setPhoneNumber(cleaned);
    if (cleaned.length > 0) {
      const result = validate.phone(cleaned);
      setPhoneError(result.valid ? "" : result.message);
    } else {
      setPhoneError("");
    }
  };

  /**
   * Triggers the SIM picker / phone number auto-fill prompt if the input field is currently empty.
   */
  const handlePhoneFocus = async () => {
    // Only show picker on first focus when input is empty to avoid interrupting user edits
    if (phoneNumber.length > 0 || hintInProgress.current) return;
    hintInProgress.current = true;
    try {
      const raw = await getPhoneNumberHint();
      if (raw) {
        const digits = normalizeIndianPhone(raw);
        if (digits.length === 10) {
          handleChangeText(digits);
          Keyboard.dismiss();
        }
      }
    } finally {
      hintInProgress.current = false;
    }
  };

  /**
   * Submits the sanitized phone number to the API, then routes to the OTP verification screen.
   */
  const handleGetOtp = async () => {
    const { isConnected } = useNetworkStore.getState();
    if (isConnected === false) {
      useNetworkStore.getState().showOfflineAlert();
      return;
    }
    const result = validate.phone(phoneNumber);
    if (!result.valid) {
      setPhoneError(result.message);
      return;
    }
    Keyboard.dismiss();
    perfService.startTrace("login_submit");
    try {
      const formattedPhone = `+91${phoneNumber}`;
      const res = await requestOtp(formattedPhone);
      perfService.stopTrace("login_submit");
      // Prefill the OTP only when the backend returns it (QA/staging convenience).
      // Consistent with the resend path in useOtp. The production backend must
      // NOT include `otp` in the response, or it would auto-fill for real users.
      const prefillOtp = res?.data?.otp ?? "";
      router.push({
        pathname: "/otp",
        params: { phone: formattedPhone, prefillOtp },
      });
    } catch {
      perfService.stopTrace("login_submit");
      // Error state is captured and handled by useAuth hook
    }
  };

  const isValid = validate.phone(phoneNumber).valid;

  return {
    router,
    phoneNumber,
    phoneError,
    loading,
    error,
    isValid,
    handleChangeText,
    handlePhoneFocus,
    handleGetOtp,
  };
}
