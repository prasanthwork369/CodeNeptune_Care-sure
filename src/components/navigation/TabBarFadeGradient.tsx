import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform } from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";

export const TabBarFadeGradient: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();

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
          (Platform.OS === "android" ? 34 : 24),
      }}
    />
  );
};
