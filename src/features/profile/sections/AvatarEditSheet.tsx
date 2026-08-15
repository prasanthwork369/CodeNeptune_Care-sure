import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { UploadSheetOptions } from "./UploadSheetOptions";

interface AvatarEditSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
}

const DURATION = 220;
const EASING = Easing.out(Easing.cubic);
// Scaled on the JS thread: exactScale calls a non-worklet helper, so it cannot
// run inside an animated style.
const SLIDE_DISTANCE = exactScale(260);

/**
 * Picker sheet for the photo preview. Deliberately not a gorhom BottomSheetModal:
 * that renders into the root portal, which sits under the preview's native Modal
 * window. This one is plain views, so it can live inside the preview itself.
 */
export const AvatarEditSheet: React.FC<AvatarEditSheetProps> = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectLibrary,
}) => {
  const adjustedBottom = useAdjustedBottomInset();
  const progress = useSharedValue(0);
  // Kept mounted until the slide-down finishes.
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      progress.value = withTiming(1, { duration: DURATION, easing: EASING });
      return;
    }
    progress.value = withTiming(
      0,
      { duration: DURATION, easing: EASING },
      (finished) => {
        if (finished) runOnJS(setRendered)(false);
      },
    );
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.55,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * SLIDE_DISTANCE }],
  }));

  if (!rendered) return null;

  return (
    <>
      <Animated.View
        style={[StyleSheet.absoluteFill, s.backdrop, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          s.sheet,
          { paddingBottom: Math.max(adjustedBottom, exactScale(24)) },
          sheetStyle,
        ]}
      >
        <UploadSheetOptions
          onSelectCamera={onSelectCamera}
          onSelectLibrary={onSelectLibrary}
          onCancel={onClose}
        />
      </Animated.View>
    </>
  );
};

const s = StyleSheet.create({
  backdrop: { backgroundColor: "#000000" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F5F5F7",
    borderTopLeftRadius: exactScale(12),
    borderTopRightRadius: exactScale(12),
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(16),
  },
});
