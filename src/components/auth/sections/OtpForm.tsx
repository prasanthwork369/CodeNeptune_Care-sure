import { Touchable } from "@/src/components/ui/Touchable";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import { OtpFormProps } from "@/src/types/auth";
import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { styles as s } from "./OtpForm.styles";

const OTP_LENGTH = 6;
// One over the code length, or replacing a digit in a full code fires no change event.
const INPUT_MAX_LENGTH = OTP_LENGTH + 1;

// Blinking caret shown in the active empty box — the real TextInput is
// invisible, so this stands in for its cursor.
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
  inputRef,
}) => {
  const [focused, setFocused] = useState(false);
  // Only paint error-red borders while there are digits to flag. After a
  // wrong code clears the boxes, the field is empty — red on empty boxes
  // hides the active highlight and looks broken. The error message below
  // still shows; the boxes go back to a clean active-green state to retype.
  const showError = !!(otpError || error) && slots.some(Boolean);

  return (
    <View>
      {/* Plain View — NOT a Pressable. A parent Pressable competes with the
          per-box Pressables for the Android touch responder and usually
          wins, so individual box taps never fired. Each box is now the sole
          tap target. The invisible TextInput sits behind them
          (pointerEvents none) purely to hold the value and drive the OS
          keyboard / SMS autofill. */}
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
                {
                  borderWidth: isActive || showError ? 2 : 1,
                  borderColor: showError
                    ? "#EF4444"
                    : isActive
                      ? "#0F7635"
                      : isFilled
                        ? "#0F7635"
                        : "#D0D5DD",
                  backgroundColor: isActive ? "#F0FDF4" : "#FFFFFF",
                },
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
          ref={(el) => {
            applyDigitsOnlyFilter(el);
            if (inputRef) {
              if (typeof inputRef === 'function') {
                inputRef(el);
              } else {
                (inputRef as React.MutableRefObject<TextInput | null>).current = el;
              }
            }
          }}
          value={inputValue}
          onChangeText={onOtpChange}
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
            <Text style={s.resendBtn}>Resend OTP</Text>
          </Touchable>
        )}
      </View>
    </View>
  );
};
