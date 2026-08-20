import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  isAppReady: boolean;
  onComplete: () => void;
}

export const SplashAnimationScreen: React.FC<Props> = ({
  isAppReady,
  onComplete,
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const compact = height < 700;
  const markSize = Math.min(compact ? 104 : 120, Math.max(88, width * 0.3));

  useEffect(() => {
    if (isAppReady) {
      onComplete();
    }
  }, [isAppReady, onComplete]);

  return (
    <View
      style={styles.container}
      accessibilityViewIsModal
      testID="splash-screen"
    >
      <LinearGradient
        colors={["#F4FAF5", "#FBFDFB", "#FFFFFF"]}
        locations={[0, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.decorativeLayer} pointerEvents="none">
        <View style={[styles.glow, styles.glowTop]} />
        <View style={[styles.glow, styles.glowBottom]} />
      </View>

      <View
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, spacing[6]),
            paddingBottom: Math.max(insets.bottom, spacing[6]),
          },
        ]}
      >
        <View style={styles.brandBlock} accessible accessibilityRole="text">
          <Image
            source={HOME_IMAGES.splashIcon}
            resizeMode="contain"
            style={{
              width: markSize,
              height: markSize,
            }}
            accessibilityIgnoresInvertColors
            importantForAccessibility="no"
          />

          <View style={styles.copyBlock}>
            <Text
              style={[styles.wordmark, compact && styles.wordmarkCompact]}
              allowFontScaling
              maxFontSizeMultiplier={1.25}
            >
              Care<Text style={styles.wordmarkAccent}>Sure</Text>
            </Text>

            <Text
              style={styles.tagline}
              allowFontScaling
              maxFontSizeMultiplier={1.35}
            >
              Healthcare, delivered with care.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F4FAF5",
    overflow: "hidden",
  },

  decorativeLayer: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(109, 196, 80, 0.08)",
  },

  glowTop: {
    top: -104,
    right: -112,
  },

  glowBottom: {
    bottom: -136,
    left: -120,
    backgroundColor: "rgba(15, 118, 53, 0.05)",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[6],
  },

  brandBlock: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },

  copyBlock: {
    alignItems: "center",
    marginTop: spacing[2],
  },

  wordmark: {
    color: "#173D25",
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.8,
    textAlign: "center",
  },

  wordmarkCompact: {
    fontSize: 28,
    lineHeight: 36,
  },

  wordmarkAccent: {
    color: colors.primary,
  },

  tagline: {
    marginTop: spacing[2],
    color: "#587060",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    textAlign: "center",
  },
});
