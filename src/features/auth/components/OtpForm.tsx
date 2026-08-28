import { Touchable } from "@/src/components/ui/Touchable";
import { AUTH_CONFIG } from "@/src/features/auth/constants/auth.constants";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { OtpFormProps } from "../types";
import { styles as s } from "./OtpForm.styles";

const { OTP_LENGTH } = AUTH_CONFIG;
const INPUT_MAX_LENGTH = OTP_LENGTH + 1;

const Caret = () => {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
    );
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[s.caret, style]} />;
};

export const OtpForm: React.FC<OtpFormProps> = ({
  slots,
  inputValue,
  otpError,
  error,
  loading,
  resendCooldown,
  activeIndex,
  onBoxPress,
  onOtpChange,
  onResend,
  onSubmitEditing,
  inputRef,
}) => {
  const [focused, setFocused] = useState(false);
  const showError = !!(otpError || error) && slots.some(Boolean);

  const setInputRef = useCallback(
    (el: TextInput | null) => {
      applyDigitsOnlyFilter(el);
      if (!inputRef) return;
      if (typeof inputRef === "function") {
        inputRef(el);
      } else {
        (inputRef as React.MutableRefObject<TextInput | null>).current = el;
      }
    },
    [inputRef],
  );

  return (
    <View>
      <View style={s.boxRow}>
        {[...Array(OTP_LENGTH)].map((_, index) => {
          const isActive = focused && index === activeIndex;
          const isFilled = !!slots[index];
          return (
            <Pressable
              key={index}
              onPress={() => onBoxPress(index)}
              style={[
                s.otpBox,
                isActive || showError ? s.boxBorderThick : s.boxBorderThin,
                showError
                  ? s.boxError
                  : isActive || isFilled
                    ? s.boxAccent
                    : s.boxIdle,
                isActive ? s.boxFillActive : s.boxFillPlain,
              ]}
            >
              {isFilled ? (
                <Text style={s.otpDigit}>{slots[index]}</Text>
              ) : isActive ? (
                <Caret />
              ) : null}
            </Pressable>
          );
        })}

        <TextInput
          ref={setInputRef}
          value={inputValue}
          onChangeText={onOtpChange}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="done"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          maxLength={INPUT_MAX_LENGTH}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          accessibilityLabel="OTP code"
          caretHidden
          selectionColor="transparent"
          contextMenuHidden
          autoCorrect={false}
          spellCheck={false}
          style={s.hiddenInput}
        />
      </View>

      {otpError || error ? (
        <Text style={s.error}>{otpError || error}</Text>
      ) : null}

      <View className="flex-row items-center justify-center mb-1">
        {resendCooldown > 0 ? (
          <Text style={s.resendText}>
            Resend OTP in{" "}
            <Text style={s.resendHighlight}>{resendCooldown}s</Text>
          </Text>
        ) : (
          <Touchable
            onPress={onResend}
            disabled={loading}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}
            className="py-2 px-4"
          >
            <View style={s.resendUnderline}>
              <Text style={s.resendBtn}>Resend OTP</Text>
            </View>
          </Touchable>
        )}
      </View>
    </View>
  );
};
