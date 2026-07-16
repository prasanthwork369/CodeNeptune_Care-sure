import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

const TRACK_WIDTH = 48;
const TRACK_BORDER = 0.83;
const TRACK_PADDING = 2;
const KNOB_SIZE = 18;

// Distance to the far edge, so the gap when on matches the padding when off.
// Derived, not hardcoded — a hardcoded value drifts the moment a size changes.
const KNOB_TRAVEL =
  TRACK_WIDTH - TRACK_BORDER * 2 - TRACK_PADDING * 2 - KNOB_SIZE;

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const translateX = useRef(
    new Animated.Value(value ? KNOB_TRAVEL : 0),
  ).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? KNOB_TRAVEL : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [value, translateX]);

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.6 : 1,
        width: TRACK_WIDTH,
        height: 24,
        borderRadius: 12,
        backgroundColor: value ? "#0F7635" : "#D1D5DB",
        borderWidth: TRACK_BORDER,
        borderColor: "#919EAB33",
        padding: TRACK_PADDING,
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: KNOB_SIZE / 2,
          backgroundColor: "#FFFFFF",
          transform: [{ translateX }],
          shadowColor: "#919EAB33",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </Pressable>
  );
};
