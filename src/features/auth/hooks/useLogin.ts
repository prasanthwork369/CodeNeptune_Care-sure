import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useNav } from "@/src/hooks/useNav";
import {
  getPhoneNumberHint,
  normalizeIndianPhone,
} from "@/src/modules/PhoneNumberHint";
import { requireInternet } from "@/src/utils/offline";
import { IS_LIVE_API } from "@/src/utils/urls";
import { sanitize, validate } from "@/src/utils/validation";
import { useRef, useState } from "react";
import { Keyboard, Platform, TextInput } from "react-native";

import { PERF_TRACES, usePerformanceTrace } from "@/src/services/firebase";
import { logger } from "@/src/utils/logger";

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
   * Sanitizes input to numeric only. Validation only runs on submit
   * (handleGetOtp) — flagging an incomplete number while the user is still
   * mid-type reads as an error for perfectly normal typing.
   */
  const handleChangeText = (text: string) => {
    // Typed overflow: already 10 digits and new text only appends — ignore it.
    if (phoneNumber.length === 10 && text.startsWith(phoneNumber)) return;
    // A fresh attempt — drop any submit-time error so it doesn't linger while editing.
    if (error) resetError();
    const cleaned = sanitize.phone(text);
    setPhoneNumber(cleaned);

    if (cleaned.length === 10) {
      const res = validate.phone(cleaned);
      setPhoneError(res.valid ? "" : res.message);
    } else if (phoneError) {
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
    if (!requireInternet()) return;
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
      // DEV-only: the QA response contains the OTP — never log it in release.
      if (__DEV__) logger.debug("[Login] requestOtp response:", res);
      // Never auto-fill against the live API — a leaked `otp` there would hand any number's account over.
      const prefillOtp = IS_LIVE_API ? "" : (res?.data?.otp ?? "");
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
