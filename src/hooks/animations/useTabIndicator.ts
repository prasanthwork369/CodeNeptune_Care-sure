import { useEffect, useState, useRef } from "react";
import { ScrollView, LayoutChangeEvent, Dimensions } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { DURATIONS } from "../../animations/configs/durations";

interface TabMeasuredLayout {
  x: number;
  width: number;
}

export const useTabIndicator = (activeId: string) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = useState<
    Record<string, TabMeasuredLayout>
  >({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (activeId && tabLayouts[activeId]) {
      const { x, width } = tabLayouts[activeId];
      const STATIC_WIDTH = 84; // Wider, more prominent bar to match image style
      const targetX = x + (width - STATIC_WIDTH) / 2;

      indicatorX.value = withTiming(targetX, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      indicatorWidth.value = withTiming(STATIC_WIDTH, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, { duration: DURATIONS.fade });

      const screenWidth = Dimensions.get("window").width;
      const targetScrollX = x - (screenWidth - width) / 2;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, targetScrollX),
          animated: true,
        });
      }, 50);
    }
  }, [activeId, tabLayouts]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
    opacity: opacity.value,
  }));

  const onTabLayout = (id: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({
      ...prev,
      [id]: { x, width },
    }));
  };

  return {
    scrollViewRef,
    onTabLayout,
    animatedIndicatorStyle,
  };
};
