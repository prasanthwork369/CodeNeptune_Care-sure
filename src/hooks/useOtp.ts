import { cartApi } from "@/src/api/cart.api";
import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useNav } from "@/src/hooks/useNav";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { NotificationNavigation } from "@/src/services/notifications/NotificationNavigation";
import { analyticsService } from "@/src/services/firebase";
import { useCartPendingStore } from "@/src/store/cartStore";
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

// SMS retriever verification module (Android native module, unavailable in Expo Go mock environment)
const useOtpVerify =
  !isExpoGo && Platform.OS === "android"
    ? require("react-native-otp-verify").useOtpVerify
    : () => ({ otp: "", hash: "" });

const OTP_LENGTH = 6;

const emptySlots = () => Array<string>(OTP_LENGTH).fill("");

// Index of the first differing char — finds the digit the keyboard just inserted.
const firstDiff = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return i;
};

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
  const { verifyOtp, requestOtp, loading, error, resetError } = useAuth();

  // One entry per box ("" = empty) so a cleared box leaves a gap.
  const hasPrefill = !!prefillOtp && prefillOtp.length === OTP_LENGTH;
  const [slots, setSlots] = useState<string[]>(() =>
    hasPrefill ? prefillOtp!.split("") : emptySlots(),
  );

  // Box the next keystroke edits; a prefilled code starts at the last box.
  const [activeSlot, setActiveSlot] = useState(() =>
    hasPrefill ? OTP_LENGTH - 1 : 0,
  );
  // A tapped box means the user is correcting — don't auto-submit then.
  const isEditingRef = useRef(false);

  const inputRef = useRef<TextInput | null>(null);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Input mirrors only filled digits; its caret is ignored so edits land on activeSlot.
  const inputValue = slots.filter(Boolean).join("");
  const code = slots.join("");

  // Cooldown countdown timer for resending OTP codes
  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Initial focus management
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const { otp: smsOtp, hash } = useOtpVerify({ numberOfDigits: 6 });

  useEffect(() => {
    if (__DEV__ && hash?.length) logger.debug("[OTP SMS Hash]", hash);
  }, [hash]);

  // Auto-fill from incoming SMS messages on Android
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!smsOtp || smsOtp.length !== OTP_LENGTH) return;
    setSlots(smsOtp.split(""));
    setActiveSlot(OTP_LENGTH - 1);
    setOtpError("");
    if (error) resetError();
    inputRef.current?.blur();
    // Auto-submit the auto-read code — the user shouldn't have to tap
    // anything when the SMS is detected.
    handleVerify(smsOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smsOtp]);

  // Clears React state and the native buffer, which otherwise keeps the old text.
  const resetOtp = () => {
    setSlots(emptySlots());
    setActiveSlot(0);
    isEditingRef.current = false;
    requestAnimationFrame(() => inputRef.current?.clear());
  };

  /**
   * Resends the OTP and prefills it if returned, or resets boxes.
   */
  const handleResend = async () => {
    if (!requireInternet()) return;
    if (!phone || resendCooldown > 0) return;
    try {
      const res = await requestOtp(phone);
      // Same rule as the login path: no auto-fill against the live API.
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

      setResendCooldown(30);
    } catch {
      // Error state is captured and handled by useAuth hook
    }
  };

  const handleBoxPress = (index: number) => {
    isEditingRef.current = true;
    setActiveSlot(index);
    const input = inputRef?.current;
    if (!input) return;
    // Blur first when the keyboard is shut, or focus() is a no-op and it stays shut.
    if (Keyboard.isVisible()) {
      input.focus();
    } else {
      input.blur();
      requestAnimationFrame(() => input.focus());
    }
  };

  /** Input text is only a signal: longer = typed, shorter = backspace; edits land on activeSlot. */
  const handleOtpChange = (value: string) => {
    setOtpError("");
    // A new keystroke is a fresh attempt — drop any lingering API error.
    if (error) resetError();
    const digits = value.replace(/\D/g, "");
    const prev = inputValue;
    const next = [...slots];

    // A whole code at once (paste / autofill) fills every box.
    if (digits.length === OTP_LENGTH && prev.length === 0) {
      setSlots(digits.split(""));
      setActiveSlot(OTP_LENGTH - 1);
      if (!isEditingRef.current) {
        inputRef.current?.blur();
        handleVerify(digits);
      }
      return;
    }

    if (digits.length < prev.length) {
      // Backspace clears the active box, leaving the gap.
      let slot = activeSlot;
      if (!next[slot]) {
        // Already empty — fall back to the nearest filled box before it.
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

    if (digits.length > prev.length) {
      // A full code only changes after a tap, so stray keys can't corrupt a prefilled code.
      if (!isEditingRef.current && next.every((d) => d !== "")) return;

      const at = firstDiff(prev, digits);
      const added = digits.slice(at, at + (digits.length - prev.length));
      let slot = activeSlot;
      for (const digit of added) {
        if (slot >= OTP_LENGTH) break;
        next[slot] = digit;
        slot += 1;
      }
      setSlots(next);
      setActiveSlot(Math.min(slot, OTP_LENGTH - 1));

      // Auto-submit only when freshly completed by typing, not while correcting.
      if (next.every((d) => d !== "") && !isEditingRef.current) {
        inputRef.current?.blur();
        handleVerify(next.join(""));
      }
    }
  };

  const activeIndex = Math.min(activeSlot, OTP_LENGTH - 1);

  /**
   * Verifies the OTP, then merges guest items into the user's cart.
   * Accepts an explicit code so auto-submit can pass the just-typed digits
   * without waiting for the otp state to commit.
   */
  const handleVerify = async (codeArg?: string) => {
    if (!requireInternet()) return;
    // Guard against double submission (auto-submit + button tap, or a
    // duplicate SMS event firing while a verify is already in flight).
    if (loading || isRedirecting) return;
    const otpCode = codeArg ?? code;
    const result = validate.otp(otpCode);
    if (!result.valid) {
      setOtpError(result.message);
      return;
    }
    if (!phone) return;
    try {
      await verifyOtp(phone, otpCode);
      void analyticsService.logLoginSuccess();
      Keyboard.dismiss();
      setIsRedirecting(true);

      // Navigate immediately; cart merge runs in the background.
      const pendingNotification =
        useNotificationNavigationStore.getState().pendingNotification;
      if (pendingNotification) {
        useNotificationNavigationStore.getState().clearPendingNotification();
        // Remove OTP from history before opening the pending destination.
        // One animation frame lets Expo Router commit the replacement before
        // the destination push, matching the cold-start notification flow.
        router.replace("/(tabs)");
        requestAnimationFrame(() => {
          NotificationNavigation.executeNavigation(pendingNotification);
        });
      } else {
        router.replace("/(tabs)");
      }

      // Detached background merge — sequential to avoid backend write collisions.
      void (async () => {
        const guestCart = useCartPendingStore.getState().guestCart;
        if (!guestCart || guestCart.items.length === 0) return;

        let anyMerged = false;
        for (const item of guestCart.items) {
          try {
            await cartApi.addItem({
              medicineId: item.medicineId,
              variantId: item.metadata?.selectedVariantId || null,
              medicineName: item.medicineName,
              medicineSlug: item.medicineSlug,
              unitPrice: Number(item.unitPrice),
              mrp: Number(
                item.metadata?.price || item.originalPrice || item.unitPrice,
              ),
              discountPercent: Number(item.discountPercent || 0),
              quantity: item.quantity,
              requiresPrescription: item.requiresPrescription,
              image: item.image,
              metadata: item.metadata,
            });
            // Remove only items that actually merged, so a single failure does
            // not wipe the whole guest cart — failed items stay for a retry.
            useCartPendingStore.getState().removeGuestItem(item.id);
            anyMerged = true;
          } catch (err) {
            if (__DEV__)
              console.warn(
                "[CartMerge] Failed to merge item:",
                item.medicineId,
                err,
              );
          }
        }

        if (anyMerged) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.CART });
        }
      })();
    } catch {
      // Wrong/expired code — clear boxes and refocus.
      resetOtp();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // A gap leaves the joined code short, so an incomplete grid can't verify.
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
