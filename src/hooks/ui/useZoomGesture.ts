import { Gesture } from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UseZoomGestureOptions {
  containerWidth: number;
  containerHeight: number;
  maxScale?: number;
}

/**
 * Shared production hook for image & document pinch-to-zoom and pan gestures.
 *
 * Uses worklet-level manualActivation on panGesture so unzoomed touches fail
 * instantly on the UI thread, preserving native iOS swipe-back gestures.
 */
export function useZoomGesture({
  containerWidth,
  containerHeight,
  maxScale = 6,
}: UseZoomGestureOptions) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    "worklet";
    scale.value = withTiming(1, { duration: 250 });
    translateX.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(0, { duration: 250 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), maxScale);
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        resetZoom();
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .onTouchesMove((_, state) => {
      "worklet";
      if (savedScale.value > 1) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onUpdate((e) => {
      if (savedScale.value > 1) {
        const maxX = (containerWidth * (savedScale.value - 1)) / 2;
        const maxY = (containerHeight * (savedScale.value - 1)) / 2;
        translateX.value = Math.min(
          Math.max(savedTranslateX.value + e.translationX, -maxX),
          maxX,
        );
        translateY.value = Math.min(
          Math.max(savedTranslateY.value + e.translationY, -maxY),
          maxY,
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      if (scale.value > 1) {
        resetZoom();
      } else {
        scale.value = withTiming(2.5, { duration: 250 });
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Exclusive(doubleTap, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return {
    scale,
    savedScale,
    translateX,
    translateY,
    resetZoom,
    composedGesture,
    animatedStyle,
  };
}
