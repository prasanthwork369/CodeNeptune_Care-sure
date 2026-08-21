import { asError } from "@/src/api/errors";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useAddMoney, useWalletBalance } from "@/src/features/wallet/hooks/useWallet";
import { useNav } from "@/src/hooks/useNav";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { requireInternet } from "@/src/utils/offline";
import { DotLottie, type Dotlottie } from "@lottiefiles/dotlottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const PRESETS = [500, 1000, 2000];
/** Fallback until the backend serves `wallet.maxTopUpAmount`. */
const DEFAULT_MAX_TOPUP = 2000;

export const AddMoneyLayout: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const { balance, loading: balanceLoading } = useWalletBalance();
  // useQuery reports isLoading=false while disabled (pre-auth), so balance
  // can briefly be null with loading=false — treat that as still pending too.
  const isBalancePending = balanceLoading || balance == null;
  const { addMoney, loading } = useAddMoney();
  // Clamped so a bad admin value cannot block top-ups entirely or invite an
  // amount the payment provider will reject.
  const { data: walletSettings } = useCartWalletSettings();
  const remoteMax = walletSettings?.wallet?.maxTopUpAmount;
  const MAX_TOPUP =
    typeof remoteMax === "number" && Number.isFinite(remoteMax) && remoteMax > 0
      ? Math.min(remoteMax, 100000)
      : DEFAULT_MAX_TOPUP;
  const router = useNav();
  const confettiRef = useRef<Dotlottie>(null);
  const inputRef = useRef<TextInput>(null);
  const backTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Or leaving during the 2s confetti still fires router.back() and pops a screen.
  useEffect(
    () => () => {
      if (backTimer.current) clearTimeout(backTimer.current);
    },
    [],
  );

  const walletBalance = Number(balance?.walletBalance ?? 0);
  const numericAmount = Number(amount) || 0;
  const selectedPreset = PRESETS.find((p) => p === numericAmount) ?? null;

  const handlePreset = (value: number) => setAmount(String(value));

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setAmount(cleaned);
  };

  const handleProceed = async () => {
    if (!numericAmount || numericAmount > MAX_TOPUP) return;
    // Money movement, so it takes the acknowledged-offline treatment the order
    // and prescription-payment flows use. Without this the mutation still fired
    // and failed at the request interceptor, surfacing as a generic "Failed"
    // alert instead of saying the connection is the reason.
    if (!requireInternet({ critical: true })) return;
    try {
      await addMoney(numericAmount);
      confettiRef.current?.play();
      backTimer.current = setTimeout(() => {
        backTimer.current = null;
        router.back();
      }, 2000);
    } catch (e) {
      Alert.alert(
        "Failed",
        asError(e).message ?? "Could not add money. Please try again.",
      );
    }
  };

  const hasError = numericAmount > MAX_TOPUP;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F6FB" }}
      behavior="padding"
      keyboardVerticalOffset={-insets.bottom}
    >
      <ScreenHeader title="Add Money" backgroundColor="#FFFFFF" showBorder />

      {/* Amount Section */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        overScrollMode="auto"
        contentContainerStyle={{
          alignItems: "center",
          paddingTop: 36,
          paddingBottom: 28,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        }}
      >
        <Text
          style={{
            fontSize: moderateScale(14),
            fontWeight: "500",
            color: "#6B7280",
            marginBottom: 12,
          }}
        >
          How much would you like to add?
        </Text>

        {/* Editable amount input */}
        <Touchable
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={{ width: "100%", alignItems: "center", marginBottom: 6 }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              // Grow with the amount instead of a fixed width — a fixed width
              // made long values (5–6 digits) scroll inside the input and clip
              // the first digit on the left.
              minWidth: exactScale(200),
              maxWidth: "92%",
              paddingHorizontal: exactScale(12),
              borderBottomWidth: 2,
              borderBottomColor: hasError
                ? "#DC2626"
                : isAmountFocused
                  ? "#0F7635"
                  : "#E5E7EB",
              paddingBottom: 4,
              gap: exactScale(4),
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(44),
                fontWeight: "800",
                color: "#111827",
              }}
            >
              ₹
            </Text>
            <TextInput
              ref={(el) => {
                applyDigitsOnlyFilter(el);

                if (inputRef) {
                  (
                    inputRef as React.MutableRefObject<TextInput | null>
                  ).current = el;
                }
              }}
              autoFocus
              value={amount}
              onChangeText={handleAmountChange}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={() => setIsAmountFocused(false)}
              placeholder="0"
              placeholderTextColor="#6A6A6A"
              keyboardType="number-pad"
              maxLength={6}
              cursorColor="#0F7635"
              selectionColor="#0F7635"
              style={{
                fontSize: moderateScale(44),
                lineHeight: moderateScale(54),
                fontWeight: "800",
                color: "#111827",
                minWidth: 100,
                minHeight: moderateScale(60),
                paddingHorizontal: 8,
                paddingVertical: 0,
                textAlignVertical: "center",
                includeFontPadding: false,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: moderateScale(12),
              fontWeight: "500",
              color: hasError
                ? "#DC2626"
                : isAmountFocused
                  ? "#0F7635"
                  : "#9CA3AF",
              marginTop: 6,
            }}
          >
            {hasError
              ? "Amount cannot exceed ₹2,000"
              : "Tap to enter a custom amount"}
          </Text>
        </Touchable>

        {isBalancePending ? (
          <ActivityIndicator
            color="#0F7635"
            size="small"
            style={{ marginBottom: 20 }}
          />
        ) : (
          <Text
            style={{
              fontSize: moderateScale(13),
              fontWeight: "500",
              color: "#6B7280",
              marginBottom: 20,
            }}
          >
            Available Balance:{" "}
            <Text style={{ fontWeight: "700", color: "#111827" }}>
              ₹{walletBalance.toLocaleString()}
            </Text>
          </Text>
        )}

        {/* Preset chips */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          {PRESETS.map((preset) => {
            const isActive = selectedPreset === preset;
            return (
              <Touchable
                key={preset}
                onPress={() => handlePreset(preset)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: isActive ? "#0F7635" : "#E5E7EB",
                  backgroundColor: isActive ? "#EFFFF5" : "#FFFFFF",
                }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(14),
                    fontWeight: "600",
                    color: isActive ? "#0F7635" : "#374151",
                  }}
                >
                  ₹{preset.toLocaleString()}
                </Text>
              </Touchable>
            );
          })}
        </View>

        <Text
          style={{
            fontSize: moderateScale(12),
            fontWeight: "500",
            color: "#9CA3AF",
          }}
        >
          Maximum Top-Up Limit: ₹{MAX_TOPUP.toLocaleString()}
        </Text>
      </ScrollView>

      <View style={{ flex: 1 }} />

      {/* Proceed Button */}
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#F5F6FB" }}>
        <View
          style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}
        >
          <Touchable
            onPress={handleProceed}
            disabled={loading || !numericAmount || hasError}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#0F7635",
              borderRadius: 14,
              height: 54,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading || !numericAmount || hasError ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <icons.lock width={18} height={18} fill="#FFFFFF" />
                <Text
                  style={{
                    fontSize: moderateScale(16),
                    fontWeight: "600",
                    color: "#FFFFFF",
                  }}
                >
                  Proceed to Pay ₹{numericAmount.toLocaleString()}
                </Text>
              </>
            )}
          </Touchable>
        </View>
      </SafeAreaView>

      {/* Confetti overlay */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
        }}
      >
        <DotLottie
          ref={confettiRef}
          source={ANIMATIONS.confetti}
          autoplay={false}
          loop={false}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
