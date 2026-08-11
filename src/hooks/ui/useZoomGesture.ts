import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UseZoomGestureOptions {
  containerWidth: number;
  containerHeight: number;
  maxScale?: number;
  /**
   * Opt-in: when provided, a horizontal drag released while NOT zoomed in
   * triggers these instead of being released untouched. Only pass these for
   * screens that want swipe-between-images — doing so means this screen's
   * pan gesture claims unzoomed horizontal touches too, which trades away
   * the native iOS edge-swipe-back preservation described below. Callers
   * that don't pass them keep the original fail-fast behavior exactly.
   */
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

/**
 * Shared production hook for image & document pinch-to-zoom and pan gestures.
 *
 * Uses worklet-level manualActivation on panGesture so unzoomed touches fail
 * instantly on the UI thread, preserving native iOS swipe-back gestures —
 * unless onSwipeLeft/onSwipeRight opt a screen into swipe-between-images.
 */
export function useZoomGesture({
  containerWidth,
  containerHeight,
  maxScale = 6,
  onSwipeLeft,
  onSwipeRight,
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

  const allowUnzoomedSwipe = !!(onSwipeLeft || onSwipeRight);

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .manualActivation(true)
    .onTouchesMove((_, state) => {
      "worklet";
      if (savedScale.value > 1 || allowUnzoomedSwipe) {
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
    .onEnd((e) => {
      if (savedScale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        return;
      }
      if (!allowUnzoomedSwipe) return;
      const isSwipeLeft =
        e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY;
      const isSwipeRight =
        e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY;
      if (isSwipeLeft && onSwipeLeft) {
        runOnJS(onSwipeLeft)();
      } else if (isSwipeRight && onSwipeRight) {
        runOnJS(onSwipeRight)();
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    // Fails fast on any real movement, so a drag hands off to panGesture
    // immediately instead of panGesture waiting on this to resolve.
    .maxDistance(10)
    .onEnd(() => {
      if (scale.value > 1) {
        resetZoom();
      } else {
        scale.value = withTiming(2.5, { duration: 250 });
        savedScale.value = 2.5;
      }
    });

  // Race, not Exclusive: panGesture activates itself manually (via
  // onTouchesMove) rather than through the declarative criteria Exclusive
  // arbitrates over, so Exclusive left it waiting on doubleTap to fail before
  // it was allowed to visibly take over — which read as "dragging does
  // nothing" while zoomed in. Race lets whichever gesture actually
  // recognizes first win immediately.
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTap, panGesture),
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
