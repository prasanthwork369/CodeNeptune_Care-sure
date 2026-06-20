import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TabBarFadeGradient: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Calculate adjusted bottom safe inset matching our tab bar alignment
  const adjustedBottom =
    Platform.OS === "android"
      ? insets.bottom > 24
        ? insets.bottom - 8
        : insets.bottom
      : insets.bottom;

  return (
    <LinearGradient
      colors={[
        "rgba(255,255,255,0)",
        "rgba(255,255,255,0.9)",
        "rgba(255,255,255,0.95)",
        "#FFFFFF",
      ]}
      locations={[0, 0.25, 0.6, 1]}
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height:
          adjustedBottom +
          (Platform.OS === "android" && insets.bottom > 24 ? 34 : 24),
      }}
    />
  );
};
