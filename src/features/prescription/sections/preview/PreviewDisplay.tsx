import { AnimatedImage } from "@/src/components/ui/AnimatedImage";
import { PdfViewer } from "@/src/components/ui/PdfViewer";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { icons } from "@/src/constants/icons";
import { PreviewDisplayProps } from "@/src/features/prescription/types";
import { Touchable } from "@/src/components/ui/Touchable";
import { useZoomGesture } from "@/src/hooks/ui/useZoomGesture";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const isPdf = (uri: string, type?: string) =>
  type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

// Memoised: upload progress ticks several times a second, and without this the
// zoomable image and its gesture handler re-render on every tick.
export const PreviewDisplay: React.FC<PreviewDisplayProps> = React.memo(
  ({
    activeItem,
    screenWidth,
    previewHeight,
    onLayout,
    onPrev,
    showPrev,
    onNext,
    showNext,
  }) => {
    const containerWidth = screenWidth - 48;

    const { resetZoom, composedGesture, animatedStyle } = useZoomGesture({
      containerWidth,
      containerHeight: previewHeight,
    });

    // Reset zoom when active item changes
    useEffect(() => {
      resetZoom();
    }, [activeItem?.localUri]);

    // Per-URI, so revisiting an already-displayed thumbnail skips the
    // skeleton, and a never-seen one always gets it — independent of index.
    const [loadedUris, setLoadedUris] = useState<Set<string>>(
      () => new Set(),
    );
    const imageOpacity = useSharedValue(0);
    const activeUri = activeItem?.localUri;
    const isActiveLoaded = activeUri ? loadedUris.has(activeUri) : false;

    // Set during render (not an effect) so the value is correct in the same
    // commit the new image mounts — an effect would run one frame after
    // paint, showing the previous item's opacity for a frame first.
    const prevUriRef = useRef<string | undefined>(undefined);
    if (activeUri !== prevUriRef.current) {
      prevUriRef.current = activeUri;
      // Snap instantly: a fresh image starts hidden behind the skeleton, a
      // previously-displayed one is shown right away with no re-fade.
      imageOpacity.value = activeUri && loadedUris.has(activeUri) ? 1 : 0;
    }

    const markLoaded = (uri: string) => {
      setLoadedUris((prev) => {
        if (prev.has(uri)) return prev;
        const next = new Set(prev);
        next.add(uri);
        return next;
      });
    };

    const handleImageDisplay = () => {
      if (!activeUri) return;
      // The skeleton unmounts only once the image is fully opaque on top of
      // it, so there's no gap between "skeleton gone" and "image visible".
      imageOpacity.value = withTiming(1, { duration: 220 }, (finished) => {
        if (finished) runOnJS(markLoaded)(activeUri);
      });
    };

    const handleImageError = () => {
      // Settle immediately so a failed load doesn't leave the skeleton
      // spinning forever — the image area just falls back to empty.
      if (!activeUri) return;
      imageOpacity.value = 1;
      markLoaded(activeUri);
    };

    const imageFadeStyle = useAnimatedStyle(() => ({
      opacity: imageOpacity.value,
    }));

    return (
      <View style={{ flex: 1, position: "relative" }}>
        <View
          className="rounded-md overflow-hidden"
          style={{
            flex: 1,
            shadowColor: "#919EAB33",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.5,
            shadowRadius: 1,
            elevation: 0,
            borderWidth: 1,
            borderColor: "#919EAB33",
            backgroundColor: "#F9FAFB",
          }}
          onLayout={(e) => onLayout(e.nativeEvent.layout.height)}
        >
          {activeItem && isPdf(activeItem.localUri, activeItem.type) ? (
            <PdfViewer
              uri={activeItem.localUri}
              style={{
                width: containerWidth,
                height: previewHeight,
                backgroundColor: "#F9FAFB",
              }}
              onError={() => Alert.alert("Error", "Could not load PDF.")}
            />
          ) : activeItem && previewHeight > 0 ? (
            <GestureDetector gesture={composedGesture}>
              <Animated.View
                style={{
                  width: containerWidth,
                  height: previewHeight,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!isActiveLoaded && (
                  <View
                    testID="preview-image-skeleton"
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  >
                    <Skeleton width="100%" height="100%" borderRadius={0} />
                  </View>
                )}
                {/* Keyed on uri: forces a fresh view per image so a stale
                    onDisplay/onError from a load abandoned by rapid thumbnail
                    switching can't land on the now-active item's callback. */}
                <AnimatedImage
                  testID="preview-image"
                  key={activeItem.localUri}
                  source={{ uri: activeItem.localUri }}
                  style={[
                    {
                      width: containerWidth,
                      height: previewHeight,
                    },
                    animatedStyle,
                    imageFadeStyle,
                  ]}
                  contentFit="contain"
                  onDisplay={handleImageDisplay}
                  onError={handleImageError}
                />
              </Animated.View>
            </GestureDetector>
          ) : null}
        </View>

        {showPrev && (
          <Touchable
            onPress={onPrev}
            style={{
              position: "absolute",
              left: -20,
              top: "50%",
              marginTop: -24,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#919EAB33",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
              elevation: 8,
              shadowColor: "#919EAB33",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
            }}
          >
            <icons.arrow_back_ios width={16} height={16} fill="#222222" />
          </Touchable>
        )}

        {showNext && (
          <Touchable
            onPress={onNext}
            style={{
              position: "absolute",
              right: -20,
              top: "50%",
              marginTop: -24,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#919EAB33",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
              elevation: 8,
              shadowColor: "#919EAB33",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
            }}
          >
            <icons.arrow_forward_ios width={16} height={16} fill="#222222" />
          </Touchable>
        )}
      </View>
    );
  },
);
PreviewDisplay.displayName = "PreviewDisplay";
