import React, { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 20 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [value]);

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.6 : 1,
        width: 48,
        height: 24,
        borderRadius: 12,
        backgroundColor: value ? "#0F7635" : "#D1D5DB",
        borderWidth: 0.83,
        borderColor: "#919EAB33",
        padding: 2,
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
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
