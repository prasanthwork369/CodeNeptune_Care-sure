import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useNav } from "@/src/hooks/useNav";
import {
  getPhoneNumberHint,
  normalizeIndianPhone,
} from "@/src/modules/PhoneNumberHint";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { sanitize, validate } from "@/src/utils/validation";
import { useRef, useState } from "react";
import { Keyboard, Platform, TextInput } from "react-native";

import { PERF_TRACES, usePerformanceTrace } from "@/src/services/firebase";

/**
 * Custom hook managing the business logic for the Login screen.
 * Handles phone number sanitization, validation, native SIM suggestions, and triggering OTP request mutations.
 */
export function useLogin() {
  const router = useNav();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { requestOtp, loading, error, resetError } = useAuth();
  const { start: startLoginTrace, stop: stopLoginTrace } = usePerformanceTrace({
    traceName: PERF_TRACES.LOGIN_SUBMIT,
    manualStart: true,
    maxDurationMs: 15_000,
  });

  const phoneInputRef = useRef<TextInput | null>(null);
  // Spends the first tap so the field never focuses; iOS has no picker.
  const [hintShieldVisible, setHintShieldVisible] = useState(
    Platform.OS === "android",
  );
  // Guards a double tap landing before the state update hides the shield.
  const hintRequested = useRef(false);

  /**
   * Sanitizes input to numeric only and performs real-time validation checks.
   */
  const handleChangeText = (text: string) => {
    // Typed overflow: already 10 digits and new text only appends — ignore it.
    if (phoneNumber.length === 10 && text.startsWith(phoneNumber)) return;
    // Editing the number is a fresh attempt — drop the previous number's API
    // error, or it resurfaces once phoneError clears.
    if (error) resetError();
    const cleaned = sanitize.phone(text);
    setPhoneNumber(cleaned);
    if (cleaned.length > 0) {
      const result = validate.phone(cleaned);
      setPhoneError(result.valid ? "" : result.message);
    } else {
      setPhoneError("");
    }
  };

  /** Shows the SIM picker on the first tap; the shield keeps the keyboard shut. */
  const handleHintPress = async () => {
    setHintShieldVisible(false);
    if (hintRequested.current) return;
    hintRequested.current = true;

    // Null on cancel, missing Play Services, or any native error.
    const raw = await getPhoneNumberHint();
    const digits = raw ? normalizeIndianPhone(raw) : "";
    if (digits.length === 10 && validate.phone(digits).valid) {
      handleChangeText(digits);
      return;
    }

    phoneInputRef.current?.focus();
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
    startLoginTrace();
    let succeeded = false;
    try {
      const formattedPhone = `+91${phoneNumber}`;
      const res = await requestOtp(formattedPhone);
      succeeded = true;
      // Prefill the OTP only when the backend returns it (QA/staging convenience).
      // Consistent with the resend path in useOtp. The production backend must
      // NOT include `otp` in the response, or it would auto-fill for real users.
      // DEV-only: the QA response contains the OTP — never log it in release.
      if (__DEV__) console.log("[Login] requestOtp response:", res);
      const prefillOtp = res?.data?.otp ?? "";
      router.push({
        pathname: "/otp",
        params: { phone: formattedPhone, prefillOtp },
      });
    } catch {
      // Error state is captured and handled by useAuth hook
    } finally {
      stopLoginTrace({ status: succeeded ? "success" : "error" });
    }
  };

  const isValid = validate.phone(phoneNumber).valid;

  return {
    phoneNumber,
    phoneError,
    loading,
    error,
    isValid,
    phoneInputRef,
    hintShieldVisible,
    handleChangeText,
    handleHintPress,
    handleGetOtp,
  };
}
