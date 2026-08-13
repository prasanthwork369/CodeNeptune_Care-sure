import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

// Sits behind the blur, so the blur samples it — keep it faint or the bar just reads white
export const GLASS_TINT = "rgba(255,255,255,0.15)";

const GLASS_EDGE = "rgba(255,255,255,0.6)";

interface TabBarGlassProps {
  /** Match the host container's radius so the specular ring follows its shape. */
  radius: number;
}

/**
 * Backdrop layers for the tab bar pill: blurred sample, specular sheen and a
 * hairline edge. All absolutely positioned, so adding it never shifts the tab
 * items or changes the width the active pill is measured against.
 */
export const TabBarGlass: React.FC<TabBarGlassProps> = ({ radius }) => (
  <>
    <BlurView
      intensity={40}
      tint={Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "light"}
      blurMethod="none"
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    />

    {/* Light falling across the top edge — what actually reads as glass on both platforms */}
    <LinearGradient
      colors={[
        "rgba(255,255,255,0.2)",
        "rgba(255,255,255,0.8)",
        "rgba(255,255,255,0.2)",
      ]}
      locations={[0, 0.45, 1]}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    />

    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: radius, borderWidth: 1, borderColor: GLASS_EDGE },
      ]}
    />
  </>
);

/**
 * Gloss for the upload button. No blur and no translucency — the orange stays
 * at full strength so the CTA keeps its weight, and only a sheen and rim sit
 * over it. Left corners only, matching the button's own radii.
 */
export const UploadButtonGlass: React.FC<TabBarGlassProps> = ({ radius }) => (
  <>
    <LinearGradient
      colors={[
        "rgba(255,255,255,0.28)",
        "rgba(255,255,255,0.08)",
        "rgba(255,255,255,0)",
      ]}
      locations={[0, 0.5, 1]}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    />

    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderTopLeftRadius: radius,
          borderBottomLeftRadius: radius,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.35)",
        },
      ]}
    />
  </>
);

/**
 * Same glass treatment scaled down for the active tab: a brighter sheen and a
 * green floor so the mint fill gains depth instead of reading as flat paint.
 * No blur of its own — it sits on the bar's backdrop, and a second blur pass
 * would both cost a frame and muddy the tint.
 */
export const ActivePillGlass: React.FC<TabBarGlassProps> = ({ radius }) => (
  <>
    <LinearGradient
      colors={[
        "rgba(255,255,255,0.1)",
        "rgba(255,255,255,0.15)",
        "rgba(54,179,126,0.1)",
      ]}
      locations={[0, 0.5, 1]}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    />

    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: radius,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.75)",
        },
      ]}
    />
  </>
);
