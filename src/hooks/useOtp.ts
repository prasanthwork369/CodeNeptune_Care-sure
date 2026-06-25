import { cartApi } from "@/src/api/cart.api";
import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useNav } from "@/src/hooks/useNav";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useCartPendingStore } from "@/src/store/cartStore";
import { isExpoGo } from "@/src/utils/environment";
import { sanitize, validate } from "@/src/utils/validation";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, TextInput } from "react-native";

// SMS retriever verification module (Android native module, unavailable in Expo Go mock environment)
const useOtpVerify =
  !isExpoGo && Platform.OS === "android"
    ? require("react-native-otp-verify").useOtpVerify
    : () => ({ otp: "", hash: "" });

/**
 * Custom hook managing the business logic for the OTP Verification screen.
 * Handles timers, autofocus states, SMS listening APIs, and guest cart merging upon login.
 */
export function useOtp() {
  const router = useNav();
  const queryClient = useQueryClient();
  const { phone, prefillOtp } = useLocalSearchParams<{
    phone: string;
    prefillOtp?: string;
  }>();
  const { verifyOtp, requestOtp, loading, error } = useAuth();

  const [otp, setOtp] = useState<string[]>(() =>
    prefillOtp && prefillOtp.length === 6
      ? prefillOtp.split("")
      : ["", "", "", "", "", ""],
  );

  // Guards auto-focus state on mount so it doesn't snap back to box 1 when prefilled/retrieved
  const filledRef = useRef(!!(prefillOtp && prefillOtp.length === 6));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Cooldown countdown timer for resending OTP codes
  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Initial focus management
  useEffect(() => {
    const t = setTimeout(() => {
      if (!filledRef.current) inputRefs.current[0]?.focus();
      else inputRefs.current[5]?.focus();
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const { otp: smsOtp, hash } = useOtpVerify({ numberOfDigits: 6 });

  useEffect(() => {
    if (__DEV__ && hash?.length) console.log("[OTP SMS Hash]", hash);
  }, [hash]);

  // Auto-fill from incoming SMS messages on Android
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!smsOtp || smsOtp.length !== 6) return;
    const digits = smsOtp.split("");
    filledRef.current = true;
    setOtp(digits);
    setOtpError("");
    setTimeout(() => inputRefs.current[5]?.focus(), 50);
    Keyboard.dismiss();
  }, [smsOtp]);

  /**
   * Resends the OTP and prefills it if returned, or resets boxes.
   */
  const handleResend = async () => {
    if (!phone || resendCooldown > 0) return;
    try {
      const res = await requestOtp(phone);
      const newPrefill = res?.data?.otp ?? "";

      if (newPrefill && newPrefill.length === 6) {
        filledRef.current = true;
        setOtp(newPrefill.split(""));
        setTimeout(() => inputRefs.current[5]?.focus(), 50);
      } else {
        filledRef.current = false;
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }

      setResendCooldown(30);
    } catch {
      // Error state is captured and handled by useAuth hook
    }
  };

  /**
   * Captures individual digit entries and controls next field focus.
   */
  const handleOtpChange = (value: string, index: number) => {
    setOtpError("");
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      setOtp([...Array(6)].map((_, i) => digits[i] ?? ""));
      if (digits.length === 6) {
        filledRef.current = true;
        setTimeout(() => inputRefs.current[5]?.focus(), 50);
        Keyboard.dismiss();
      }
      return;
    }
    const cleaned = sanitize.otpDigit(value);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    if (cleaned && index < 5) inputRefs.current[index + 1]?.focus();
  };

  /**
   * Backspace handling and input overrides for already-filled boxes.
   */
  const handleKeyPress = (e: any, index: number) => {
    const key = e.nativeEvent.key;
    if (key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (/^\d$/.test(key) && otp[index]) {
      const newOtp = [...otp];
      newOtp[index] = key;
      setOtp(newOtp);
      if (index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Verifies the full OTP code, then merges guest items into user account's cart.
   */
  const handleVerify = async () => {
    const otpCode = otp.join("");
    const result = validate.otp(otpCode);
    if (!result.valid) {
      setOtpError(result.message);
      return;
    }
    if (!phone) return;
    try {
      await verifyOtp(phone, otpCode);
      Keyboard.dismiss();
      setIsRedirecting(true);

      // Merge guest cart items into backend database cart sequentially (one by one) to prevent database collisions in real-time sync
      const guestCart = useCartPendingStore.getState().guestCart;
      if (guestCart && guestCart.items.length > 0) {
        for (const item of guestCart.items) {
          try {
            await cartApi.addItem({
              medicineId: item.medicineId,
              variantId: item.metadata?.selectedVariantId || null,
              medicineName: item.medicineName,
              medicineSlug: item.medicineSlug,
              unitPrice: Number(item.unitPrice),
              mrp: Number(
                item.metadata?.price ||
                  item.originalPrice ||
                  item.unitPrice,
              ),
              discountPercent: Number(item.discountPercent || 0),
              quantity: item.quantity,
              requiresPrescription: item.requiresPrescription,
              image: item.image,
              metadata: item.metadata,
            });
          } catch (err) {
            if (__DEV__) console.warn("[CartMerge] Failed to merge item:", item.medicineId, err);
          }
        }
        useCartPendingStore.getState().clearGuestCart();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.CART });
      }

      router.replace("/(tabs)");
    } catch {
      // Error state is captured and handled by useAuth hook
    }
  };

  const isValid = validate.otp(otp.join("")).valid;
  const isButtonLoading = loading || isRedirecting;

  return {
    router,
    phone,
    otp,
    otpError,
    error,
    resendCooldown,
    isButtonLoading,
    isValid,
    inputRefs,
    handleResend,
    handleOtpChange,
    handleKeyPress,
    handleVerify,
  };
}
