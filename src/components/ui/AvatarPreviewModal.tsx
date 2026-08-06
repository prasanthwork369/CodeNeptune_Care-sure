import { AnimatedImage } from "@/src/components/ui/AnimatedImage";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import {
  useAvatarPreviewAnimation,
  type PreviewRect,
} from "@/src/hooks/ui/useAvatarPreviewAnimation";
import { useZoomGesture } from "@/src/hooks/ui/useZoomGesture";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AvatarPreviewModalProps {
  visible: boolean;
  uri: string | null;
  title?: string;
  originRect: PreviewRect | null;
  onClose: () => void;
  /** Shows the edit button in the top bar when provided. */
  onEdit?: () => void;
  /** Return true to swallow Android back, e.g. when a child sheet is open. */
  onHardwareBack?: () => boolean;
  /** Rendered inside the preview window, above the photo. */
  children?: React.ReactNode;
}

/**
 * Full-screen photo preview that grows out of the avatar it was tapped from,
 * with pinch/double-tap zoom and swipe-down to dismiss.
 */
export const AvatarPreviewModal: React.FC<AvatarPreviewModalProps> = ({
  visible,
  uri,
  title,
  originRect,
  onClose,
  onEdit,
  onHardwareBack,
  children,
}) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = width;

  const zoom = useZoomGesture({
    containerWidth: size,
    containerHeight: size,
    maxScale: 4,
  });

  const { open, close, dismissGesture, backdropStyle, frameStyle, photoStyle } =
    useAvatarPreviewAnimation({
      rect: originRect,
      screenWidth: width,
      screenHeight: height,
      size,
      zoomScale: zoom.savedScale,
      onClosed: onClose,
    });

  // Each gesture fails in the other's regime, so they can run simultaneously.
  // Memoised, otherwise every render re-attaches the detector.
  const gesture = useMemo(
    () => Gesture.Simultaneous(zoom.composedGesture, dismissGesture),
    [zoom.composedGesture, dismissGesture],
  );

  // Started from onShow, not on mount: on Android the transparent Modal's window
  // is still being created at mount and swallows the first animation frames.
  const handleShow = () => {
    zoom.resetZoom();
    open();
  };

  const handleBack = () => {
    if (onHardwareBack?.()) return;
    close();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onShow={handleShow}
      onRequestClose={handleBack}
    >
      {/* Gestures inside an RN Modal need their own root view on Android. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "#000000" },
            backdropStyle,
          ]}
        />

        <GestureDetector gesture={gesture}>
          <View style={{ flex: 1 }} collapsable={false}>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 0,
                  top: (height - size) / 2,
                  width: size,
                  height: size,
                },
                frameStyle,
              ]}
            >
              {uri ? (
                <AnimatedImage
                  source={{ uri }}
                  style={[
                    { width: size, height: size },
                    zoom.animatedStyle,
                    photoStyle,
                  ]}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : null}
            </Animated.View>
          </View>
        </GestureDetector>

        <Animated.View
          style={[
            {
              position: "absolute",
              top: insets.top + 8,
              left: 0,
              right: 0,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 8,
            },
            backdropStyle,
          ]}
        >
          <Touchable onPress={close} activeOpacity={0.7} style={s.iconBtn}>
            <icons.arrow_back_white
              width={exactScale(20)}
              height={exactScale(20)}
            />
          </Touchable>

          {title ? (
            <Text numberOfLines={1} className="flex-1 font-inter-semibold" style={s.title}>
              {title}
            </Text>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {onEdit ? (
            <Touchable onPress={onEdit} activeOpacity={0.7} style={s.iconBtn}>
              <icons.edit_white
                width={exactScale(19)}
                height={exactScale(19)}
              />
            </Touchable>
          ) : null}
        </Animated.View>

        {children}
      </GestureHandlerRootView>
    </Modal>
  );
};

const s = StyleSheet.create({
  iconBtn: {
    width: exactScale(40),
    height: exactScale(40),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(16),
    color: "#FFFFFF",
    marginHorizontal: 4,
  },
});
