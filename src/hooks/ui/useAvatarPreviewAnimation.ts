import { Gesture } from "react-native-gesture-handler";
import {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

export interface PreviewRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseAvatarPreviewAnimationOptions {
  rect: PreviewRect | null;
  screenWidth: number;
  screenHeight: number;
  size: number;
  zoomScale: SharedValue<number>;
  onClosed: () => void;
}

const OPEN_DURATION = 220;
const OPEN_EASING = Easing.out(Easing.cubic);
// Shorter with a gentler tail: reversing the open curve left the photo hovering
// beside the avatar for most of the collapse before it landed.
const CLOSE_DURATION = 180;
const CLOSE_EASING = Easing.out(Easing.quad);
// Corners straighten in the first half, so the rest of the frames write a constant.
const RADIUS_PROGRESS = 0.5;
// The backdrop clears well before the photo is home, and the photo cross-fades
// into the real avatar over the last stretch. Otherwise both are still visible on
// the final frame and vanish together when the modal unmounts, which reads as a jump.
const BACKDROP_PROGRESS = 0.65;
const PHOTO_FADE_PROGRESS = 0.22;
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 900;

/**
 * WhatsApp-style open/close for a photo preview: the full-screen frame grows out
 * of the avatar circle it was tapped from and collapses back into it.
 *
 * The swipe-to-dismiss pan is gated on zoomScale so it yields to useZoomGesture's
 * own pan once the photo is zoomed in.
 */
export function useAvatarPreviewAnimation({
  rect,
  screenWidth,
  screenHeight,
  size,
  zoomScale,
  onClosed,
}: UseAvatarPreviewAnimationOptions) {
  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);

  // Where the collapsed frame sits: the tapped circle, expressed as an offset
  // from the centred full-screen frame.
  const startScale = rect ? rect.width / size : 0.25;
  const startX = rect ? rect.x + rect.width / 2 - screenWidth / 2 : 0;
  const startY = rect ? rect.y + rect.height / 2 - screenHeight / 2 : 0;

  const open = () => {
    dragY.value = 0;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: OPEN_DURATION,
      easing: OPEN_EASING,
    });
  };

  // Callable from both threads: the close button runs it on JS, the pan on UI.
  const close = () => {
    "worklet";
    const config = { duration: CLOSE_DURATION, easing: CLOSE_EASING };
    dragY.value = withTiming(0, config);
    progress.value = withTiming(0, config, (finished) => {
      if (finished) runOnJS(onClosed)();
    });
  };

  // Vertical only: a sideways drag fails the gesture instead of moving the photo.
  const dismissGesture = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .failOffsetX([-24, 24])
    .onUpdate((e) => {
      // Zoomed in the drag belongs to useZoomGesture's pan; two fingers mean a pinch.
      if (zoomScale.value > 1 || e.numberOfPointers > 1) return;
      dragY.value = e.translationY;
    })
    .onEnd((e) => {
      const flung =
        Math.abs(e.velocityY) > DISMISS_VELOCITY && Math.abs(dragY.value) > 40;
      if (Math.abs(dragY.value) > DISMISS_DISTANCE || flung) {
        close();
        return;
      }
      dragY.value = withTiming(0, { duration: 180 });
    });

  // Backdrop and the header controls fade together while dragging.
  const backdropStyle = useAnimatedStyle(() => {
    const fade =
      1 - Math.min(Math.abs(dragY.value) / (screenHeight * 0.4), 0.7);
    const reveal = interpolate(
      progress.value,
      [0, BACKDROP_PROGRESS],
      [0, 1],
      "clamp",
    );
    return { opacity: reveal * fade };
  });

  // Dragging only moves the photo — it keeps its full width, like WhatsApp.
  const frameStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [startX, 0]) },
      { translateY: interpolate(progress.value, [0, 1], [startY, dragY.value]) },
      { scale: interpolate(progress.value, [0, 1], [startScale, 1]) },
    ],
  }));

  // Radius lives on the image, not a clipping parent: an animated radius on a view
  // with overflow:hidden rebuilds Android's clip outline every frame.
  const photoStyle = useAnimatedStyle(() => ({
    // The radius scales with the frame, so at progress 0 it is exactly the circle.
    borderRadius: interpolate(
      progress.value,
      [0, RADIUS_PROGRESS],
      [size / 2, 0],
      "clamp",
    ),
    opacity: interpolate(
      progress.value,
      [0, PHOTO_FADE_PROGRESS],
      [0, 1],
      "clamp",
    ),
  }));

  return { open, close, dismissGesture, backdropStyle, frameStyle, photoStyle };
}
