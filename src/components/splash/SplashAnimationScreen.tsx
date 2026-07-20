import { ANIMATIONS } from "@/src/constants/images";
import { HOME_IMAGES } from "@/src/constants/images";
import Constants from "expo-constants";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const EASE_IN = Easing.in(Easing.ease);
const IS_EXPO_GO = Constants.executionEnvironment === "storeClient";
const SPLASH_DURATION_MS = IS_EXPO_GO ? 650 : 2500;

// Expo Go cannot load custom native modules. Keep this require out of its
// startup path so the splash never flashes black before the router mounts.
const NativeDotLottie = IS_EXPO_GO
  ? null
  : require("@lottiefiles/dotlottie-react-native").DotLottie;

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
    // Cancel the pending timing if we unmount early (fast nav / hot reload) so
    // the completion callback can't fire after teardown.
    return () => cancelAnimation(screenOpacity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <View style={styles.lottieWrapper}>
        {NativeDotLottie ? (
          <NativeDotLottie
            source={ANIMATIONS.splash}
            autoplay
            loop={false}
            layout={{ fit: "cover" }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <Image
            source={HOME_IMAGES.splashIcon}
            resizeMode="contain"
            style={styles.expoGoFallback}
          />
        )}
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
  expoGoFallback: {
    width: "52%",
    height: "52%",
  },
});
