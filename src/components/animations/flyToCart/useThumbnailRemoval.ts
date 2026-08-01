import { useEffect } from "react";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

interface ThumbnailRemovalState {
  isPending?: boolean;
  isRemoving?: boolean;
  isBehindRemoving?: boolean;
}

// A cart thumbnail's exit: a mask wipes over the image while the image shrinks,
// then the whole circle scales away. Shared by both cart banners.
export const useThumbnailRemoval = ({
  isPending,
  isRemoving,
  isBehindRemoving,
}: ThumbnailRemovalState) => {
  // Only a pending thumbnail starts hidden — it is genuinely waiting for a
  // flight to land, and pops in when it does. Anything else already exists, so
  // fading it in just reads as a blink (or, mid-flight, as an empty circle).
  const scale = useSharedValue(isPending ? 0 : 1);
  const opacity = useSharedValue(isPending ? 0 : 1);
  const maskScale = useSharedValue(0);
  const imageScale = useSharedValue(1);

  useEffect(() => {
    if (isRemoving) {
      maskScale.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
      imageScale.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
      scale.value = withDelay(200, withTiming(0, { duration: 200 }));
      opacity.value = withDelay(200, withTiming(0, { duration: 200 }));
    } else if (isBehindRemoving) {
      scale.value = 1;
      opacity.value = 1;
      maskScale.value = 0;
      imageScale.value = 1;
    } else if (!isPending) {
      scale.value = withTiming(1, { duration: 180 });
      opacity.value = withTiming(1, { duration: 180 });
      maskScale.value = 0;
      imageScale.value = 1;
    } else {
      scale.value = 0;
      opacity.value = 0;
      maskScale.value = 0;
      imageScale.value = 1;
    }
  }, [isPending, isRemoving, isBehindRemoving]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const maskStyle = useAnimatedStyle(() => ({
    transform: [{ scale: maskScale.value }],
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  return {
    containerStyle,
    maskStyle,
    imageStyle,
    shouldPlaySmoke: !!(isRemoving || isBehindRemoving),
  };
};
