import { AUTH_CONFIG } from "@/src/features/auth/constants/auth.constants";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { mergeGuestCartItems } from "@/src/features/auth/services/cartMerge.service";
import { useNav } from "@/src/hooks/useNav";
import { NotificationNavigation } from "@/src/services/notifications/NotificationNavigation";
import { analyticsService } from "@/src/services/firebase";
import { useNotificationNavigationStore } from "@/src/store/notificationNavigationStore";
import { isExpoGo } from "@/src/utils/environment";
import { IS_LIVE_API } from "@/src/utils/urls";
import { validate } from "@/src/utils/validation";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, TextInput } from "react-native";
import { requireInternet } from "@/src/utils/offline";
import { logger } from "@/src/utils/logger";

const { OTP_LENGTH, RESEND_COOLDOWN_SECONDS } = AUTH_CONFIG;

// Android native SMS retriever module (mocked in Expo Go)
const useOtpVerify =
  !isExpoGo && Platform.OS === "android"
    ? require("react-native-otp-verify").useOtpVerify
    : () => ({ otp: "", hash: "" });

const emptySlots = () => Array<string>(OTP_LENGTH).fill("");

const findFirstDiff = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return i;
};

/**
 * Manages state and side-effects for the OTP Verification screen.
 */
export function useOtp() {
  const router = useNav();
  const queryClient = useQueryClient();
  const { phone, prefillOtp } = useLocalSearchParams<{
    phone: string;
    prefillOtp?: string;
  }>();
  const { verifyOtp, requestOtp, loading, error, resetError } = useAuth();

  const hasPrefill = !!prefillOtp && prefillOtp.length === OTP_LENGTH;
  const [slots, setSlots] = useState<string[]>(() =>
    hasPrefill ? prefillOtp!.split("") : emptySlots(),
  );

  const [activeSlot, setActiveSlot] = useState(() =>
    hasPrefill ? OTP_LENGTH - 1 : 0,
  );
  const isEditingRef = useRef(false);

  const inputRef = useRef<TextInput | null>(null);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState<number>(
    RESEND_COOLDOWN_SECONDS,
  );
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Synchronous submission locks to prevent duplicate submissions within a single tick
  const verifyLockRef = useRef(false);
  const mergeLockRef = useRef(false);

  const inputValue = slots.filter(Boolean).join("");
  const code = slots.join("");

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const { otp: smsOtp, hash } = useOtpVerify({ numberOfDigits: OTP_LENGTH });

  useEffect(() => {
    if (__DEV__ && hash?.length) logger.debug("[OTP SMS Hash]", hash);
  }, [hash]);

  // Auto-submit code received via Android SMS retriever
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!smsOtp || smsOtp.length !== OTP_LENGTH) return;
    setSlots(smsOtp.split(""));
    setActiveSlot(OTP_LENGTH - 1);
    setOtpError("");
    if (error) resetError();
    inputRef.current?.blur();
    handleVerify(smsOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smsOtp]);

  const resetOtp = () => {
    setSlots(emptySlots());
    setActiveSlot(0);
    isEditingRef.current = false;
    requestAnimationFrame(() => inputRef.current?.clear());
  };

  const handleResend = async () => {
    if (!requireInternet()) return;
    if (!phone || resendCooldown > 0) return;
    try {
      const res = await requestOtp(phone);
      const newPrefill = IS_LIVE_API ? "" : (res?.data?.otp ?? "");

      if (newPrefill && newPrefill.length === OTP_LENGTH) {
        setOtpError("");
        if (error) resetError();
        setSlots(newPrefill.split(""));
        setActiveSlot(OTP_LENGTH - 1);
        isEditingRef.current = false;
        inputRef.current?.blur();
      } else {
        resetOtp();
        setTimeout(() => inputRef.current?.focus(), 50);
      }

      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      // Error state captured by useAuth mutation
    }
  };

  const handleBoxPress = (index: number) => {
    isEditingRef.current = true;
    setActiveSlot(index);
    const input = inputRef?.current;
    if (!input) return;

    if (Keyboard.isVisible()) {
      input.focus();
    } else {
      input.blur();
      requestAnimationFrame(() => input.focus());
    }
  };

  const handleOtpChange = (value: string) => {
    setOtpError("");
    if (error) resetError();
    const digits = value.replace(/\D/g, "");
    const prev = inputValue;
    const next = [...slots];

    // Bulk autofill / paste
    if (digits.length === OTP_LENGTH && prev.length === 0) {
      setSlots(digits.split(""));
      setActiveSlot(OTP_LENGTH - 1);
      if (!isEditingRef.current) {
        inputRef.current?.blur();
        handleVerify(digits);
      }
      return;
    }

    // Backspace handling
    if (digits.length < prev.length) {
      let slot = activeSlot;
      if (!next[slot]) {
        let prior = slot - 1;
        while (prior >= 0 && !next[prior]) prior--;
        if (prior < 0) return;
        slot = prior;
      }
      next[slot] = "";
      setSlots(next);
      setActiveSlot(slot);
      return;
    }

    // Typing digits
    if (digits.length > prev.length) {
      if (!isEditingRef.current && next.every((d) => d !== "")) return;

      const at = findFirstDiff(prev, digits);
      const added = digits.slice(at, at + (digits.length - prev.length));
      let slot = activeSlot;
      for (const digit of added) {
        if (slot >= OTP_LENGTH) break;
        next[slot] = digit;
        slot += 1;
      }
      setSlots(next);
      setActiveSlot(Math.min(slot, OTP_LENGTH - 1));

      // Auto-submit when completed by sequential typing
      if (next.every((d) => d !== "") && !isEditingRef.current) {
        inputRef.current?.blur();
        handleVerify(next.join(""));
      }
    }
  };

  const activeIndex = Math.min(activeSlot, OTP_LENGTH - 1);

  const handleVerify = async (codeArg?: string) => {
    if (!requireInternet()) return;
    if (verifyLockRef.current || loading || isRedirecting) return;

    const otpCode = codeArg ?? code;
    const result = validate.otp(otpCode);
    if (!result.valid) {
      setOtpError(result.message);
      return;
    }
    if (!phone) return;

    verifyLockRef.current = true;
    try {
      await verifyOtp(phone, otpCode);
      void analyticsService.logLoginSuccess();
      Keyboard.dismiss();
      setIsRedirecting(true);

      const pendingNotification =
        useNotificationNavigationStore.getState().pendingNotification;
      if (pendingNotification) {
        useNotificationNavigationStore.getState().clearPendingNotification();
        router.replace("/(tabs)");
        requestAnimationFrame(() => {
          NotificationNavigation.executeNavigation(pendingNotification);
        });
      } else {
        router.replace("/(tabs)");
      }

      // Merge guest cart in background after navigation
      void (async () => {
        if (mergeLockRef.current) return;
        mergeLockRef.current = true;
        try {
          await mergeGuestCartItems(queryClient);
        } finally {
          mergeLockRef.current = false;
        }
      })();
    } catch {
      verifyLockRef.current = false;
      resetOtp();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const isValid = validate.otp(code).valid;
  const isButtonLoading = loading || isRedirecting;

  return {
    router,
    phone,
    slots,
    inputValue,
    otpError,
    error,
    resendCooldown,
    isButtonLoading,
    isValid,
    inputRef,
    activeIndex,
    handleBoxPress,
    handleResend,
    handleOtpChange,
    handleVerify,
  };
}
