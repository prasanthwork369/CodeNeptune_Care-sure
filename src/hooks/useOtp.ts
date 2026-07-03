import { cartApi } from "@/src/api/cart.api";
import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useNav } from "@/src/hooks/useNav";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useCartPendingStore } from "@/src/store/cartStore";
import { isExpoGo } from "@/src/utils/environment";
import { validate } from "@/src/utils/validation";
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
  const { verifyOtp, requestOtp, loading, error, resetError } = useAuth();

  // Single string of typed digits. The form renders one hidden TextInput
  // over 6 display boxes — per-box inputs relied on onKeyPress (not
  // guaranteed for Android soft keyboards) and controlled-value resync
  // during fast typing, which let digits pile up inside one box.
  const [otp, setOtp] = useState<string>(() =>
    prefillOtp && prefillOtp.length === 6 ? prefillOtp : "",
  );

  const inputRef = useRef<TextInput | null>(null);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Controls the hidden input's text selection so a tapped box can be
  // edited in place. Undefined = uncontrolled (natural end-of-string cursor)
  // so normal fast typing is never fought. Set to a 1-char range only when
  // a filled box is tapped, so the next keystroke replaces just that digit.
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

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
    if (__DEV__ && hash?.length) console.log("[OTP SMS Hash]", hash);
  }, [hash]);

  // Auto-fill from incoming SMS messages on Android
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!smsOtp || smsOtp.length !== 6) return;
    setOtp(smsOtp);
    setOtpError("");
    setSelection(undefined);
    inputRef.current?.blur();
    // Auto-submit the auto-read code — the user shouldn't have to tap
    // anything when the SMS is detected.
    handleVerify(smsOtp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smsOtp]);

  // Clears BOTH the React state and the native input buffer. Setting the
  // controlled value to "" alone leaves Android's TextInput holding the old
  // text, so the next keystroke arrives as "<oldcode><newchar>" and the
  // cleared code reappears. .clear() empties the native buffer too.
  const resetOtp = () => {
    inputRef.current?.clear();
    setOtp("");
    setSelection(undefined);
  };

  /**
   * Resends the OTP and prefills it if returned, or resets boxes.
   */
  const handleResend = async () => {
    if (!phone || resendCooldown > 0) return;
    try {
      const res = await requestOtp(phone);
      const newPrefill = res?.data?.otp ?? "";

      if (newPrefill && newPrefill.length === 6) {
        setSelection(undefined);
        setOtp(newPrefill);
      } else {
        resetOtp();
        setTimeout(() => inputRef.current?.focus(), 50);
      }

      setResendCooldown(30);
    } catch {
      // Error state is captured and handled by useAuth hook
    }
  };

  /**
   * Tapping a box: if it's a filled box, select that one character so the
   * next keystroke replaces it in place (the rest of the code is kept). If
   * it's an empty box, park the cursor at the first empty slot — a
   * contiguous code can't have gaps, so entry can't jump further ahead.
   */
  const handleBoxPress = (index: number) => {
    if (index < otp.length) {
      setSelection({ start: index, end: index + 1 });
    } else {
      setSelection({ start: otp.length, end: otp.length });
    }
    const input = inputRef.current;
    if (!input) return;
    // If the keyboard was dismissed (e.g. Android back button, or our own
    // blur after auto-submit) the input can still be "focused" in RN's
    // state — then focus() is a no-op and the keyboard stays shut. When the
    // keyboard isn't visible, blur first so the next focus() truly reopens
    // it; when it's already open, just focus so the selection applies with
    // no flicker.
    if (Keyboard.isVisible()) {
      input.focus();
    } else {
      input.blur();
      requestAnimationFrame(() => input.focus());
    }
  };

  /**
   * Single change handler for the hidden input — typing, backspace, paste,
   * and SMS autofill all flow through here as plain text changes. The OS
   * has already applied any in-place replacement via the selection above.
   */
  const handleOtpChange = (value: string) => {
    setOtpError("");
    // A new keystroke is a fresh attempt — drop any lingering API error so
    // the boxes don't stay red while the user retypes.
    if (error) resetError();
    const digits = value.replace(/\D/g, "").slice(0, 6);
    // "Editing" = a box was tapped, so a selection is held. In that mode we
    // advance the highlight to the NEXT box (sequential in-place editing)
    // rather than snapping it to the first empty slot. Fresh left-to-right
    // typing has no selection, so it flows naturally at the end.
    const editing = selection;
    setOtp(digits);

    if (editing) {
      const next = editing.start + 1;
      setSelection(next < 6 ? { start: next, end: next + 1 } : undefined);
    } else {
      setSelection(undefined);
    }

    // Auto-submit only when the code is freshly completed by normal typing —
    // NOT when fixing a digit in an already-full code (that would submit
    // before the user finishes correcting it).
    if (digits.length === 6 && !editing) {
      inputRef.current?.blur();
      handleVerify(digits);
    }
  };

  // The box showing the active border/caret: the tapped box while a
  // selection is held, otherwise the first empty box.
  const activeIndex = selection
    ? Math.min(selection.start, 5)
    : Math.min(otp.length, 5);

  /**
   * Verifies the OTP, then merges guest items into the user's cart.
   * Accepts an explicit code so auto-submit can pass the just-typed digits
   * without waiting for the otp state to commit.
   */
  const handleVerify = async (codeArg?: string) => {
    // Guard against double submission (auto-submit + button tap, or a
    // duplicate SMS event firing while a verify is already in flight).
    if (loading || isRedirecting) return;
    const otpCode = codeArg ?? otp;
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
      // Wrong or expired code (error text is surfaced by useAuth). Clear the
      // boxes and refocus so the user can retype immediately — the standard
      // recovery pattern in GPay/WhatsApp/banking OTP screens.
      resetOtp();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const isValid = validate.otp(otp).valid;
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
    inputRef,
    selection,
    activeIndex,
    handleBoxPress,
    handleResend,
    handleOtpChange,
    handleVerify,
  };
}
