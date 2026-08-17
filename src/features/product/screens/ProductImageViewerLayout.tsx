import { AnimatedImage } from "@/src/components/ui/AnimatedImage";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useZoomGesture } from "@/src/hooks/ui/useZoomGesture";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ViewabilityConfig, ViewToken } from "react-native";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const THUMB_SIZE = exactScale(56);

// ─── Per-page zoomable image ─────────────────────────────────────────────────

interface ZoomablePageProps {
  uri: string;
  width: number;
  height: number;
}

/**
 * Each gallery page owns its own isolated zoom state.
 * Pinch, double-tap, and zoomed pan work independently per page.
 * No shared translateX between pages — zero contamination.
 */
const ZoomablePage = React.memo(({ uri, width, height }: ZoomablePageProps) => {
  const { composedGesture, zoomAnimatedStyle } = useZoomGesture({
    containerWidth: width,
    containerHeight: height,
    // No swipe callbacks — swiping between pages is handled by the
    // native FlatList pager, not Reanimated translateX.
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={{
          width,
          height,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <AnimatedImage
          source={{ uri }}
          style={[{ width, height }, zoomAnimatedStyle]}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </Animated.View>
    </GestureDetector>
  );
});
ZoomablePage.displayName = "ZoomablePage";

// ─── Layout ──────────────────────────────────────────────────────────────────

export const ProductImageViewerLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const { width } = useWindowDimensions();

  // FlatList drives containerHeight from its own onLayout, but we still
  // need an explicit height so each page fills the available space.
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

  const startIndex = Number(initialIndex) || 0;

  // visualActiveIndex drives the thumbnail border and updates as soon as the
  // next page crosses 50% visibility — no wait for momentum to fully stop.
  const [visualActiveIndex, setVisualActiveIndex] = useState(startIndex);

  const flatListRef = useRef<FlatList<string>>(null);
  const thumbListRef = useRef<ScrollView>(null);

  // Prefetch all images into memory-disk cache on mount so pages load
  // instantly without decode stalls mid-swipe.
  useEffect(() => {
    const validUrls = urls.filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    );
    if (validUrls.length > 0) {
      void Image.prefetch(validUrls, "memory-disk").catch(() => {
        // Prefetch failures must not block preview.
      });
    }
  }, [urls]);

  // ── Rendering ───────────────────────────────────────────────────────────

  const renderPage = useCallback(
    ({ item }: { item: string }) => {
      if (containerHeight === 0) return null;
      return <ZoomablePage uri={item} width={width} height={containerHeight} />;
    },
    [width, containerHeight],
  );

  const keyExtractor = useCallback(
    (item: string, index: number) => `${item}-${index}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width],
  );

  // ── Native paging + viewability callbacks ───────────────────────────────

  // Fires as soon as a page becomes >50% visible during the swipe.
  // Only updates thumbnail visual state — no heavy work.
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setVisualActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  // Must be stable (useRef) — FlatList will warn and re-register listeners
  // if viewabilityConfigCallbackPairs identity changes between renders.
  const viewabilityConfig = useRef<ViewabilityConfig>({
    itemVisiblePercentThreshold: 50,
  });

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: viewabilityConfig.current,
      onViewableItemsChanged,
    },
  ]);

  // ── Thumbnail tap ───────────────────────────────────────────────────────

  const selectImage = useCallback(
    (index: number) => {
      if (index === visualActiveIndex) return;
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setVisualActiveIndex(index);
    },
    [visualActiveIndex],
  );

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title={productName || "Product Image"} />

      {/* Native paged FlatList — no custom translateX, no offset rebase */}
      <View
        className="flex-1 overflow-hidden"
        onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      >
        {containerHeight > 0 && (
          <FlatList
            ref={flatListRef}
            data={urls}
            renderItem={renderPage}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            initialScrollIndex={startIndex}
            viewabilityConfigCallbackPairs={
              viewabilityConfigCallbackPairs.current
            }
            // Virtualize only 1 page on each side — enough for smooth
            // swipe while keeping memory low for large galleries.
            windowSize={3}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            removeClippedSubviews
            decelerationRate="fast"
          />
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
            ref={thumbListRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: exactScale(16),
              gap: exactScale(10),
            }}
          >
            {urls.map((uri, index) => {
              const isActive = index === visualActiveIndex;
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
                    cachePolicy="memory-disk"
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
