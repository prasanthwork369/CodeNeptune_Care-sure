import { useState } from "react";
import { LayoutChangeEvent } from "react-native";
import { SharedValue, runOnJS, useAnimatedReaction } from "react-native-reanimated";

export function useBannerVisibility(scrollY: SharedValue<number>, screenHeight: number) {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [carouselY, setCarouselY] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);

  useAnimatedReaction(
    () =>
      scrollY.value + screenHeight > carouselY &&
      scrollY.value < carouselY + carouselHeight,
    (visible, prevVisible) => {
      if (visible !== prevVisible) {
        runOnJS(setIsBannerVisible)(visible);
      }
    },
    [carouselY, carouselHeight, screenHeight],
  );

  const onCarouselLayout = (e: LayoutChangeEvent) => {
    setCarouselY(e.nativeEvent.layout.y);
    setCarouselHeight(e.nativeEvent.layout.height);
  };

  return { isBannerVisible, onCarouselLayout };
}
