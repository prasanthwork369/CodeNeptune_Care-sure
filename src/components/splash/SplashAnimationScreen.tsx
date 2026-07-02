import { HOME_IMAGES } from "@/src/constants/images";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const SPLASH_LOGO = HOME_IMAGES.splashIcon;

const LOGO_SIZE = exactScale(110);

// Spring-like easing using bezier — runs entirely on the UI thread,
// no JS physics computation, no stutter under CPU load.
const SPRING_EASING = Easing.bezier(0.34, 1.56, 0.64, 1);
const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.ease);

// Small settle delay lets the component finish painting before
// animations start — avoids the first-frame jank from JS thread
// being busy with auth init and DB queries at the same time.
const SETTLE = 80;

interface Props {
  onComplete: () => void;
}

export const SplashAnimationScreen: React.FC<Props> = ({ onComplete }) => {
  const logoScale   = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);

  const textY       = useSharedValue(exactScale(16));
  const textOpacity = useSharedValue(0);

  const taglineOpacity = useSharedValue(0);
  const screenOpacity  = useSharedValue(1);

  useEffect(() => {
    // All animations delayed by SETTLE so the component has painted
    // one clean frame before motion starts.

    // Logo scales in with spring-like overshoot
    logoOpacity.value = withDelay(SETTLE, withTiming(1, { duration: 300 }));
    logoScale.value   = withDelay(SETTLE, withTiming(1, { duration: 500, easing: SPRING_EASING }));

    // Brand name slides up
    textOpacity.value = withDelay(SETTLE + 320, withTiming(1, { duration: 340, easing: EASE_OUT }));
    textY.value       = withDelay(SETTLE + 320, withTiming(0, { duration: 340, easing: EASE_OUT }));

    // Tagline fades in
    taglineOpacity.value = withDelay(SETTLE + 500, withTiming(1, { duration: 320 }));

    // Screen fades out → reveal app underneath
    screenOpacity.value = withDelay(
      SETTLE + 1800,
      withTiming(0, { duration: 350, easing: EASE_IN }, (done) => {
        "worklet";
        if (done) runOnJS(onComplete)();
      }),
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const taglineStyle   = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const screenStyle    = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <Animated.View style={[styles.logoWrapper, logoStyle]}>
        <Image source={SPLASH_LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={styles.brandName}>CareSure</Text>
      </Animated.View>

      <Animated.View style={taglineStyle}>
        <Text style={styles.tagline}>Medicine delivered with care</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  textBlock: {
    marginTop: exactScale(20),
    alignItems: "center",
  },
  brandName: {
    fontSize: moderateScale(26),
    fontWeight: "800",
    color: "#0F7635",
    letterSpacing: 0.5,
    fontFamily: "Inter_800ExtraBold",
  },
  tagline: {
    marginTop: exactScale(6),
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#6A6A6A",
    letterSpacing: 0.2,
    fontFamily: "Inter_500Medium",
  },
});
