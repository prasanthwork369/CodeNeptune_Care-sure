import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TabBarFadeGradient: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const { bottom: rawBottom } = useSafeAreaInsets();

  // On gesture nav, adjustedBottom is small (~16) so a large fixed offset
  // pushes the gradient top above the banner when the tab bar hides.
  // Use a tight offset for gesture nav, larger for 3-button nav.
  const is3Button = Platform.OS === "android" && rawBottom > 24;
  const extraHeight = Platform.OS === "android" ? (is3Button ? 28 : 24) : 24;

  return (
    <LinearGradient
      colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.90)", "#FFFFFF"]}
      locations={[0, 0.22, 1]}
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: adjustedBottom + extraHeight,
      }}
    />
  );
};
