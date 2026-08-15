import { AnimatedImage } from "@/src/components/ui/AnimatedImage";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useZoomGesture } from "@/src/hooks/ui/useZoomGesture";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const THUMB_SIZE = exactScale(56);

export const ProductImageViewerLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const { width } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(0);

  const { imageUrls, initialIndex, productName } = useLocalSearchParams<{
    imageUrls: string;
    initialIndex?: string;
    productName?: string;
  }>();

  const urls: string[] = useMemo(
    () => (imageUrls ? JSON.parse(imageUrls) : []),
    [imageUrls],
  );
  const [activeIndex, setActiveIndex] = useState(Number(initialIndex) || 0);
  const currentUrl = urls[activeIndex] ?? "";

  const onContainerLayout = (e: LayoutChangeEvent) =>
    setContainerHeight(e.nativeEvent.layout.height);

  const { resetZoom, composedGesture, animatedStyle } = useZoomGesture({
    containerWidth: width,
    containerHeight,
    // Swipe left = next image, swipe right = previous — only active while
    // not zoomed in (useZoomGesture gates this internally).
    onSwipeLeft: () => goToNext(),
    onSwipeRight: () => goToPrev(),
  });

  const selectImage = (index: number) => {
    if (index === activeIndex) return;
    resetZoom();
    setActiveIndex(index);
  };

  const goToNext = () => {
    if (activeIndex >= urls.length - 1) return;
    resetZoom();
    setActiveIndex(activeIndex + 1);
  };

  const goToPrev = () => {
    if (activeIndex <= 0) return;
    resetZoom();
    setActiveIndex(activeIndex - 1);
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title={productName || "Product Image"} />

      <View className="flex-1" onLayout={onContainerLayout}>
        {containerHeight > 0 && (
          <GestureDetector gesture={composedGesture}>
            <Animated.View
              style={{
                width,
                height: containerHeight,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <AnimatedImage
                source={{ uri: currentUrl }}
                style={[{ width, height: containerHeight }, animatedStyle]}
                contentFit="contain"
              />
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      {urls.length > 1 && (
        <View
          className="bg-white border-t border-[#EEEFF1]"
          style={{
            paddingVertical: exactScale(12),
            paddingBottom: adjustedBottom + exactScale(12),
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: exactScale(16),
              gap: exactScale(10),
            }}
          >
            {urls.map((uri, index) => {
              const isActive = index === activeIndex;
              return (
                <Touchable
                  key={`${uri}-${index}`}
                  onPress={() => selectImage(index)}
                  style={{
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: exactScale(8),
                    borderWidth: isActive ? 2 : 1,
                    borderColor: isActive ? "#0F7635" : "#E5E7EB",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Touchable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
