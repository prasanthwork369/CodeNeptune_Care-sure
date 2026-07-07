import { ANIMATIONS } from "@/src/constants/images";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const EASE_IN = Easing.in(Easing.ease);
const SPLASH_DURATION_MS = 2500; // Duration to show the splash screen

interface Props {
  onComplete: () => void;
}

export const SplashAnimationScreen: React.FC<Props> = ({ onComplete }) => {
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Wait for the splash animation to play, then fade out and unmount
    screenOpacity.value = withDelay(
      SPLASH_DURATION_MS,
      withTiming(0, { duration: 350, easing: EASE_IN }, (done) => {
        "worklet";
        if (done) runOnJS(onComplete)();
      }),
    );
  }, []);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <View style={styles.lottieWrapper}>
        <DotLottie
          source={ANIMATIONS.splash}
          autoplay
          loop={false}
          layout={{ fit: "cover" }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
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
  lottieWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
