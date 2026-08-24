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
 * Per-page pinch-to-zoom, double-tap, and zoomed-state pan.
 *
 * Horizontal swiping between pages is fully delegated to the native
 * paged FlatList in ProductImageViewerLayout — this hook owns zoom only.
 *
 * panGesture fails immediately via manualActivation when NOT zoomed
 * (savedScale === 1), so native FlatList paging gets every unzoomed
 * horizontal drag without competition.
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

  // Unchanged — used externally when the viewer swaps to new/unrelated
  // content (page change, modal open), left as-is since that's outside
  // today's scope and other screens already rely on this exact behavior.
  const resetZoom = () => {
    "worklet";
    scale.value = withTiming(1, { duration: 200 });
    translateX.value = 0;
    translateY.value = 0;
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // Eased — used when a live pinch/double-tap settles back to 1x.
  // translateX/Y used to snap instantly while scale eased, so a pan-then-
  // reset jumped to center before shrinking; easing all three together
  // reads as one smooth zoom-out instead.
  const resetZoomSmooth = () => {
    "worklet";
    scale.value = withTiming(1, { duration: 200 });
    translateX.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      "worklet";
      scale.value = Math.min(Math.max(savedScale.value * e.scale, 1), maxScale);
    })
    .onEnd(() => {
      "worklet";
      if (scale.value <= 1) {
        resetZoomSmooth();
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .manualActivation(true)
    .onTouchesMove((_, state) => {
      "worklet";
      // Only activate when zoomed in — unzoomed drags pass straight through
      // to the native FlatList pager, preserving full-speed native momentum.
      if (savedScale.value > 1) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onUpdate((e) => {
      "worklet";
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
      "worklet";
      if (savedScale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    // Fails fast on any real movement so a drag hands off to panGesture
    // immediately instead of panGesture waiting on this to resolve.
    .maxDistance(10)
    .onEnd(() => {
      "worklet";
      if (scale.value > 1) {
        resetZoomSmooth();
      } else {
        scale.value = withTiming(2.5, { duration: 250 });
        savedScale.value = 2.5;
      }
    });

  // Race, not Exclusive: panGesture activates itself manually via
  // onTouchesMove, so Exclusive would leave it waiting on doubleTap to
  // fail first — which read as "drag does nothing" while zoomed in.
  // Race lets whichever gesture actually recognizes first win immediately.
  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    Gesture.Race(doubleTap, panGesture),
  );

  const zoomAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Alias kept for backward-compat with AvatarPreviewModal,
  // PrescriptionViewerLayout and PreviewDisplay which destructure animatedStyle.
  const animatedStyle = zoomAnimatedStyle;

  return {
    scale,
    savedScale,
    translateX,
    translateY,
    resetZoom,
    composedGesture,
    zoomAnimatedStyle,
    animatedStyle,
  };
}
