import { asError } from "@/src/api/errors";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useAddMoney, useWalletBalance } from "@/src/features/wallet/hooks/useWallet";
import { useNav } from "@/src/hooks/useNav";
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
import { styles as s } from "./AddMoneyLayout.styles";

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
  // Stays true through the confetti/back() delay so the button doesn't
  // re-enable while this screen is still visible after a successful top-up.
  const [isSuccess, setIsSuccess] = useState(false);
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
      setIsSuccess(true);
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
      style={s.root}
      behavior="padding"
      keyboardVerticalOffset={-insets.bottom}
    >
      <ScreenHeader title="Add Money" backgroundColor="#FFFFFF" showBorder />

      {/* Amount Section */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        overScrollMode="auto"
        contentContainerStyle={s.scrollContent}
      >
        <Text style={s.promptText}>
          How much would you like to add?
        </Text>

        {/* Editable amount input */}
        <Touchable
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={s.inputTouchable}
        >
          <View
            style={[
              s.inputWrapper,
              {
                borderBottomColor: hasError
                  ? "#DC2626"
                  : isAmountFocused
                    ? "#0F7635"
                    : "#E5E7EB",
              },
            ]}
          >
            <Text style={s.currencySymbol}>
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
              style={s.textInput}
            />
          </View>
          <Text
            style={[
              s.helperText,
              {
                color: hasError
                  ? "#DC2626"
                  : isAmountFocused
                    ? "#0F7635"
                    : "#9CA3AF",
              },
            ]}
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
            style={s.balanceLoader}
          />
        ) : (
          <Text style={s.balanceText}>
            Available Balance:{" "}
            <Text style={s.balanceValueBold}>
              ₹{walletBalance.toLocaleString()}
            </Text>
          </Text>
        )}

        {/* Preset chips */}
        <View style={s.presetRow}>
          {PRESETS.map((preset) => {
            const isActive = selectedPreset === preset;
            return (
              <Touchable
                key={preset}
                onPress={() => handlePreset(preset)}
                activeOpacity={0.8}
                style={[
                  s.presetChip,
                  {
                    borderColor: isActive ? "#0F7635" : "#E5E7EB",
                    backgroundColor: isActive ? "#EFFFF5" : "#FFFFFF",
                  },
                ]}
              >
                <Text
                  style={[
                    s.presetChipText,
                    { color: isActive ? "#0F7635" : "#374151" },
                  ]}
                >
                  ₹{preset.toLocaleString()}
                </Text>
              </Touchable>
            );
          })}
        </View>

        <Text style={s.maxLimitText}>
          Maximum Top-Up Limit: ₹{MAX_TOPUP.toLocaleString()}
        </Text>
      </ScrollView>

      <View style={s.spacer} />

      {/* Proceed Button */}
      <SafeAreaView edges={["bottom"]} style={s.bottomSafeArea}>
        <View style={s.proceedWrap}>
          <Touchable
            onPress={handleProceed}
            disabled={loading || isSuccess || !numericAmount || hasError}
            activeOpacity={0.85}
            style={[
              s.proceedBtn,
              {
                opacity:
                  loading || isSuccess || !numericAmount || hasError ? 0.5 : 1,
              },
            ]}
          >
            {loading || isSuccess ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <icons.lock width={18} height={18} fill="#FFFFFF" />
                <Text style={s.proceedBtnText}>
                  Proceed to Pay ₹{numericAmount.toLocaleString()}
                </Text>
              </>
            )}
          </Touchable>
        </View>
      </SafeAreaView>

      {/* Confetti overlay */}
      <View pointerEvents="none" style={s.confettiOverlay}>
        <DotLottie
          ref={confettiRef}
          source={ANIMATIONS.confetti}
          autoplay={false}
          loop={false}
          style={s.confettiAnimation}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
