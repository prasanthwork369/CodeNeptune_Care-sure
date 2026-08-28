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
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { styles as s } from "./ProductImageViewerLayout.styles";

// ─── Per-page zoomable image ─────────────────────────────────────────────────

interface ZoomablePageProps {
  uri: string;
  width: number;
  height: number;
}

const ZoomablePage = React.memo(({ uri, width, height }: ZoomablePageProps) => {
  const { composedGesture, zoomAnimatedStyle } = useZoomGesture({
    containerWidth: width,
    containerHeight: height,
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          s.zoomableContainer,
          {
            width,
            height,
          },
        ]}
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

const VIEWABILITY_CONFIG: ViewabilityConfig = {
  itemVisiblePercentThreshold: 50,
};

// ─── Layout ──────────────────────────────────────────────────────────────────

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

  const startIndex = Number(initialIndex) || 0;

  const [visualActiveIndex, setVisualActiveIndex] = useState(startIndex);

  const flatListRef = useRef<FlatList<string>>(null);
  const thumbListRef = useRef<ScrollView>(null);

  useEffect(() => {
    const validUrls = urls.filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    );
    if (validUrls.length > 0) {
      void Image.prefetch(validUrls, "memory-disk").catch(() => {});
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

  // Fires as soon as a page becomes >50% visible during the swipe.
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setVisualActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const selectImage = useCallback(
    (index: number) => {
      if (index === visualActiveIndex) return;
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setVisualActiveIndex(index);
    },
    [visualActiveIndex],
  );

  return (
    <View style={s.root}>
      <ScreenHeader title={productName || "Product Image"} />

      {/* Native paged FlatList */}
      <View
        style={s.listContainer}
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
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={VIEWABILITY_CONFIG}
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
          style={[
            s.thumbnailStrip,
            {
              paddingBottom: adjustedBottom + exactScale(12),
            },
          ]}
        >
          <ScrollView
            ref={thumbListRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={s.thumbScrollContent}
          >
            {urls.map((uri, index) => {
              const isActive = index === visualActiveIndex;
              return (
                <Touchable
                  key={`${uri}-${index}`}
                  onPress={() => selectImage(index)}
                  style={[
                    s.thumbWrapper,
                    isActive && s.thumbWrapperActive,
                  ]}
                >
                  <Image
                    source={{ uri }}
                    style={s.thumbImage}
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
