import { useEffect } from "react";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const easeOut = Easing.out(Easing.cubic);

export function useSlideUp(delayMs: number) {
  const opacity = useSharedValue(delayMs <= 0 ? 1 : 0);
  const translateY = useSharedValue(delayMs <= 0 ? 0 : 20);

  useEffect(() => {
    if (delayMs > 0) {
      opacity.value = withDelay(
        delayMs,
        withTiming(1, { duration: 350, easing: easeOut }),
      );
      translateY.value = withDelay(
        delayMs,
        withTiming(0, { duration: 350, easing: easeOut }),
      );
    }
  }, [delayMs]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}
