import { AUTH_CONFIG } from "@/src/features/auth/constants/auth.constants";
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

const { PHONE_DIGITS } = AUTH_CONFIG;

/**
 * Manages phone input state, SIM hint picker, and OTP requests on the Login screen.
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
  const [hintShieldVisible, setHintShieldVisible] = useState(
    Platform.OS === "android",
  );
  const hintRequested = useRef(false);

  const handleChangeText = (text: string) => {
    if (phoneNumber.length === PHONE_DIGITS && text.startsWith(phoneNumber)) return;
    if (error) resetError();
    const cleaned = sanitize.phone(text);
    setPhoneNumber(cleaned);

    if (cleaned.length === PHONE_DIGITS) {
      const res = validate.phone(cleaned);
      setPhoneError(res.valid ? "" : res.message);
    } else if (phoneError) {
      setPhoneError("");
    }
  };

  const handleHintPress = async () => {
    setHintShieldVisible(false);
    if (hintRequested.current) return;
    hintRequested.current = true;

    const raw = await getPhoneNumberHint();
    const digits = raw ? normalizeIndianPhone(raw) : "";
    if (digits.length === PHONE_DIGITS && validate.phone(digits).valid) {
      handleChangeText(digits);
      return;
    }

    phoneInputRef.current?.focus();
  };

  const handleGetOtp = async () => {
    if (loading) return;
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
      if (__DEV__) logger.debug("[Login] requestOtp response:", res);

      // In non-live test environments, prefill returned OTP for convenience
      const prefillOtp = IS_LIVE_API ? "" : (res?.data?.otp ?? "");
      router.push({
        pathname: "/otp",
        params: { phone: formattedPhone, prefillOtp },
      });
    } catch {
      // Error state captured by useAuth mutation
    } finally {
      stopLoginTrace({ status: succeeded ? "success" : "error" });
    }
  };

  const handleSubmitEditing = () => {
    if (phoneNumber.length === PHONE_DIGITS && !loading) {
      void handleGetOtp();
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
    handleSubmitEditing,
  };
}
