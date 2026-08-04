import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const MIN_DISPLAY_MS = 600;
const REDUCED_MOTION_DISPLAY_MS = 450;
const SLOW_LOAD_MESSAGE_MS = 1_800;

interface Props {
  isAppReady: boolean;
  onComplete: () => void;
}

/**
 * Branded launch curtain.
 *
 * The minimum display time and app initialisation run in parallel. The curtain
 * exits only when both are complete, avoiding blank frames and routing flashes.
 */
export const SplashAnimationScreen: React.FC<Props> = ({
  isAppReady,
  onComplete,
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compact = height < 700;
  const markSize = Math.min(compact ? 104 : 120, Math.max(88, width * 0.3));

  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);
  const [showSlowLoad, setShowSlowLoad] = useState(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const completionStarted = useRef(false);
  const slowLoadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const screenOpacity = useSharedValue(1);
  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.86);
  const copyOpacity = useSharedValue(0);
  const copyOffset = useSharedValue(8);
  const loaderOffset = useSharedValue(-56);

  useEffect(() => {
    let active = true;
    let minimumTimer: ReturnType<typeof setTimeout> | undefined;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (!active) return;
        setReduceMotion(enabled);
        minimumTimer = setTimeout(
          () => setMinimumTimeElapsed(true),
          enabled ? REDUCED_MOTION_DISPLAY_MS : MIN_DISPLAY_MS,
        );
      })
      .catch(() => {
        setReduceMotion(false);
        minimumTimer = setTimeout(
          () => setMinimumTimeElapsed(true),
          MIN_DISPLAY_MS,
        );
      });

    slowLoadTimer.current = setTimeout(
      () => setShowSlowLoad(true),
      SLOW_LOAD_MESSAGE_MS,
    );

    return () => {
      active = false;
      if (minimumTimer) clearTimeout(minimumTimer);
      if (slowLoadTimer.current) clearTimeout(slowLoadTimer.current);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion === null) return;

    if (reduceMotion) {
      markOpacity.value = 1;
      markScale.value = 1;
      copyOpacity.value = 1;
      copyOffset.value = 0;
      loaderOffset.value = 0;
      return;
    }

    markOpacity.value = withTiming(1, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
    markScale.value = withSpring(1, {
      damping: 17,
      stiffness: 150,
      mass: 0.8,
    });
    copyOpacity.value = withDelay(
      180,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    copyOffset.value = withDelay(
      180,
      withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    loaderOffset.value = withRepeat(
      withSequence(
        withTiming(56, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        withTiming(-56, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [
    copyOffset,
    copyOpacity,
    loaderOffset,
    markOpacity,
    markScale,
    reduceMotion,
  ]);

  useEffect(() => {
    if (
      !isAppReady ||
      !minimumTimeElapsed ||
      reduceMotion === null ||
      completionStarted.current
    ) {
      return;
    }

    completionStarted.current = true;
    // Or the 1.8s slow-load bar flashes in mid-fade as the curtain leaves.
    if (slowLoadTimer.current) {
      clearTimeout(slowLoadTimer.current);
      slowLoadTimer.current = null;
    }
    const finish = () => onComplete();

    if (reduceMotion) {
      finish();
      return;
    }

    screenOpacity.value = withTiming(
      0,
      { duration: 280, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        "worklet";
        if (finished) runOnJS(finish)();
      },
    );
  }, [isAppReady, minimumTimeElapsed, onComplete, reduceMotion, screenOpacity]);

  useEffect(
    () => () => {
      cancelAnimation(screenOpacity);
      cancelAnimation(markOpacity);
      cancelAnimation(markScale);
      cancelAnimation(copyOpacity);
      cancelAnimation(copyOffset);
      cancelAnimation(loaderOffset);
    },
    [
      copyOffset,
      copyOpacity,
      loaderOffset,
      markOpacity,
      markScale,
      screenOpacity,
    ],
  );

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));
  const copyStyle = useAnimatedStyle(() => ({
    opacity: copyOpacity.value,
    transform: [{ translateY: copyOffset.value }],
  }));
  const loaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: loaderOffset.value }],
  }));

  return (
    <Animated.View
      style={[styles.container, screenStyle]}
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
          <Animated.View style={markStyle}>
            <Image
              source={HOME_IMAGES.splashIcon}
              resizeMode="contain"
              style={{ width: markSize, height: markSize }}
              accessibilityIgnoresInvertColors
              importantForAccessibility="no"
            />
          </Animated.View>

          <Animated.View style={[styles.copyBlock, copyStyle]}>
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
          </Animated.View>
        </View>

        <View
          style={[styles.loadingArea, { bottom: Math.max(insets.bottom, 24) }]}
          accessibilityRole="progressbar"
          accessibilityLabel="CareSure is starting"
          accessibilityValue={{ text: "Loading" }}
          accessibilityLiveRegion="polite"
        >
          {showSlowLoad && (
            <>
              <View style={styles.loadingTrack}>
                <Animated.View style={[styles.loadingIndicator, loaderStyle]} />
              </View>
              <Text
                style={styles.loadingLabel}
                allowFontScaling
                maxFontSizeMultiplier={1.3}
              >
                Getting everything ready…
              </Text>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F4FAF5",
    overflow: "hidden",
  },
  decorativeLayer: {
    ...StyleSheet.absoluteFillObject,
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
  loadingArea: {
    position: "absolute",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  loadingTrack: {
    width: 88,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#DDEADF",
    overflow: "hidden",
  },
  loadingIndicator: {
    width: 32,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  loadingLabel: {
    marginTop: spacing[2],
    color: "#587060",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
});
