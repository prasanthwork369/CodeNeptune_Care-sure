import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as s } from "./GlassHeader.styles";

export interface GlassHeaderProps {
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  blurIntensity?: number;
  showBorder?: boolean;
  style?: ViewStyle;
}

/**
 * Modern Expo SDK 57 Translucent Glassmorphic Header Component.
 */
export const GlassHeader: React.FC<GlassHeaderProps> = ({
  title,
  onBack,
  rightSlot,
  blurIntensity = 50,
  showBorder = true,
  style,
}) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={[
        s.headerContainer,
        {
          paddingTop: Math.max(insets.top, exactScale(20)) + exactScale(8),
          overflow: "hidden",
          backgroundColor: "rgba(255, 255, 255, 0.65)",
        },
        showBorder && {
          borderBottomWidth: 1,
          borderBottomColor: "rgba(145, 158, 171, 0.2)",
        },
        style,
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint={Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "light"}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.4)",
          "rgba(255, 255, 255, 0.1)",
        ]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <View style={s.contentRow}>
        <Touchable
          onPress={handleBack}
          style={s.backButton}
        >
          <icons.arrow_back
            width={exactScale(18)}
            height={exactScale(18)}
            fill={colors.text}
          />
        </Touchable>

        <Text
          style={s.titleText}
          numberOfLines={1}
        >
          {title}
        </Text>

        {rightSlot}
      </View>
    </View>
  );
};
