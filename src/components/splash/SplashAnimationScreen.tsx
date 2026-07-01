import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SPLASH_LOGO = require("../../../assets/images/splash-icon.png");

const { width } = Dimensions.get("window");
const LOGO_SIZE = exactScale(110);
const RING_SIZE = exactScale(140);

// Duration budget:
//   0ms   — logo springs in
// 350ms   — pulse ring 1 expands
// 550ms   — pulse ring 2 expands (staggered)
// 450ms   — brand text slides up
// 650ms   — tagline fades in
// 1800ms  — hold complete
// 2000ms  — screen fades out
// 2400ms  — onComplete fires

interface Props {
  onComplete: () => void;
}

const PulseRing = ({
  delay,
  maxScale,
}: {
  delay: number;
  maxScale: number;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(0.45, { duration: 180 }),
        withTiming(0, { duration: 700, easing: Easing.out(Easing.exp) }),
      ),
    );
    scale.value = withDelay(
      delay,
      withTiming(maxScale, {
        duration: 880,
        easing: Easing.out(Easing.exp),
      }),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.ring, animStyle]} />;
};

export const SplashAnimationScreen: React.FC<Props> = ({ onComplete }) => {
  const logoScale = useSharedValue(0.35);
  const logoOpacity = useSharedValue(0);

  const textTranslateY = useSharedValue(exactScale(18));
  const textOpacity = useSharedValue(0);

  const taglineOpacity = useSharedValue(0);

  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo springs in
    logoScale.value = withSpring(1, { damping: 14, stiffness: 110 });
    logoOpacity.value = withTiming(1, { duration: 320 });

    // Brand text slides up
    textOpacity.value = withDelay(
      450,
      withTiming(1, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );
    textTranslateY.value = withDelay(
      450,
      withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );

    // Tagline fades in
    taglineOpacity.value = withDelay(
      650,
      withTiming(1, { duration: 400 }),
    );

    // Screen fades out → triggers app
    screenOpacity.value = withDelay(
      2000,
      withTiming(0, { duration: 380, easing: Easing.in(Easing.ease) }, (done) => {
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
    transform: [{ translateY: textTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* Pulse rings — behind logo */}
      <View style={styles.ringContainer}>
        <PulseRing delay={350} maxScale={2.4} />
        <PulseRing delay={560} maxScale={3.1} />

        {/* Logo */}
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image
            source={SPLASH_LOGO}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Brand text */}
      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={styles.brandName}>CareSure</Text>
      </Animated.View>

      {/* Tagline */}
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
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: "#0F7635",
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
