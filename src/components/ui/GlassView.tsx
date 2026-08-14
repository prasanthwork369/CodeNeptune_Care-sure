import { BlurView, BlurViewProps } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";

export interface GlassViewProps extends ViewProps {
  /** Blur intensity (1-100), default 40 */
  intensity?: number;
  /** Radius for border and specular sheen highlight */
  radius?: number;
  /** Specular border tint color */
  borderColor?: string;
  /** Backdrop material tint */
  tint?: BlurViewProps["tint"];
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Expo SDK 57 Glassmorphic Backdrop View Component.
 * Renders hardware-accelerated BlurView with top specular sheen gradient and hairline edge.
 */
export const GlassView: React.FC<GlassViewProps> = ({
  intensity = 40,
  radius = 16,
  borderColor = "rgba(255, 255, 255, 0.45)",
  tint = Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "light",
  style,
  children,
  ...rest
}) => {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
        },
        style,
      ]}
      {...rest}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        experimentalBlurMethod="none"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      {/* Top light reflection / specular sheen */}
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.35)",
          "rgba(255, 255, 255, 0.12)",
          "rgba(255, 255, 255, 0.02)",
        ]}
        locations={[0, 0.4, 1]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle hairline edge highlight */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: 1,
            borderColor,
          },
        ]}
      />

      {children}
    </View>
  );
};

export interface GlassCardProps extends GlassViewProps {
  elevated?: boolean;
}

/**
 * Floating Glass Card Component for popups, callouts, and elevated containers.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  elevated = true,
  style,
  radius = 20,
  children,
  ...rest
}) => {
  return (
    <GlassView
      radius={radius}
      style={[
        elevated
          ? ({
              boxShadow: "0px 8px 24px 0px rgba(0, 0, 0, 0.08)",
            } as ViewStyle)
          : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </GlassView>
  );
};
