import { cartApi } from "@/src/api/cart.api";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useNav } from "@/src/hooks/useNav";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useCartPendingStore } from "@/src/store/cartStore";
import { isExpoGo } from "@/src/utils/environment";
import { sanitize, validate } from "@/src/utils/validation";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { styles as s } from "./OtpLayout.styles";
import { AuthFooter } from "./sections/AuthFooter";
import { AuthScreenShell } from "./sections/AuthScreenShell";
import { OtpForm } from "./sections/OtpForm";
import { styles as formStyles } from "./sections/OtpForm.styles";

// react-native-otp-verify is a native module unavailable in Expo Go
const useOtpVerify =
  !isExpoGo && Platform.OS === "android"
    ? require("react-native-otp-verify").useOtpVerify
    : () => ({ otp: "", hash: "" });

export const OtpLayout: React.FC = () => {
  const router = useNav();
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
  // Tracks whether the OTP arrived pre-filled (route param, SMS retriever,
  // resend, or paste) — guards the mount auto-focus from stealing focus
  // back to the 1st box when the 6th box should be focused instead.
  const filledRef = useRef(!!(prefillOtp && prefillOtp.length === 6));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first input on mount so keyboard is visible when SMS arrives.
  // Guarded by filledRef so it doesn't steal focus back from the last box
  // if the OTP is already pre-filled (route param) or autofill lands first.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!filledRef.current) inputRefs.current[0]?.focus();
      else inputRefs.current[5]?.focus();
    }, 300);
    return () => clearTimeout(t);
  }, []);

  // Android SMS Retriever — reads OTP automatically when SMS arrives
  // SMS must end with the app hash: "Your OTP is 123456 <#> AbCdEfGhIjK"
  // Get hash: OtpVerify.getHash().then(hashes => console.log(hashes)) — share with backend
  const { otp: smsOtp, hash } = useOtpVerify({ numberOfDigits: 6 });

  useEffect(() => {
    if (__DEV__ && hash?.length) console.log("[OTP SMS Hash]", hash);
  }, [hash]);

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

  const handleResend = async () => {
    if (!phone || resendCooldown > 0) return;
    try {
      const res = await requestOtp(phone);
      const newPrefill = res?.data?.otp ?? "";

      // Prefill with the new OTP if provided, else clear the fields
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
      // error state is set by the hook
    }
  };

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

  const handleKeyPress = (e: any, index: number) => {
    const key = e.nativeEvent.key;
    if (key === "Backspace") {
      if (otp[index]) {
        // Clear current box and stay — user retypes here
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Box already empty — go back
        inputRefs.current[index - 1]?.focus();
      }
    } else if (/^\d$/.test(key) && otp[index]) {
      // Box is filled — maxLength blocks onChangeText, so replace directly here
      const newOtp = [...otp];
      newOtp[index] = key;
      setOtp(newOtp);
      if (index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

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

      // Merge guest cart items
      const guestCart = useCartPendingStore.getState().guestCart;
      if (guestCart && guestCart.items.length > 0) {
        await Promise.all(
          guestCart.items.map(
            (item) =>
              cartApi
                .addItem({
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
                })
                .catch(() => {}), // Ignore individual failures
          ),
        );
        useCartPendingStore.getState().clearGuestCart();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMER.CART });
      }

      router.replace("/(tabs)");
    } catch {
      // error state is set by the hook
    }
  };

  const isValid = validate.otp(otp.join("")).valid;
  const isButtonLoading = loading || isRedirecting;

  return (
    <AuthScreenShell
      onSkip={() => router.replace("/(tabs)")}
      footer={
        <View>
          <View className="items-start px-2" style={{ marginBottom: 4 }}>
            <Text style={s.title}>Verify OTP</Text>
            <View className="flex-row items-center mt-2">
              <Text style={s.phone}>{phone}</Text>
              <Touchable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Edit phone number"
              >
                <Text style={s.editBtn}>Edit</Text>
              </Touchable>
            </View>
          </View>

          <OtpForm
            otp={otp}
            otpError={otpError}
            error={error}
            loading={isButtonLoading}
            resendCooldown={resendCooldown}
            onOtpChange={handleOtpChange}
            onKeyPress={handleKeyPress}
            onResend={handleResend}
            inputRefs={inputRefs}
          />

          <Touchable
            activeOpacity={0.8}
            onPress={handleVerify}
            disabled={isButtonLoading || !isValid}
            accessibilityRole="button"
            accessibilityLabel="Verify and continue"
            className="bg-brand-primary rounded-lg items-center justify-center flex-row"
            style={[
              formStyles.btn,
              { opacity: isButtonLoading || !isValid ? 0.6 : 1 },
            ]}
          >
            {isButtonLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={formStyles.btnText}>Verify & Continue</Text>
                <icons.arrow_forward_white
                  width={scale(13)}
                  height={scale(13)}
                  fill="#ffffff"
                />
              </>
            )}
          </Touchable>
          <View style={{ height: 24 }} />
          <AuthFooter />
        </View>
      }
    />
  );
};
