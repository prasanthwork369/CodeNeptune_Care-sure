import { useEffect, useState, useRef } from "react";
import { ScrollView, LayoutChangeEvent, Dimensions } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { durations } from "@/src/theme";

interface TabMeasuredLayout {
  x: number;
  width: number;
}

// Wider, more prominent bar to match image style — always this width, so it
// doesn't need its own animated shared value.
const STATIC_WIDTH = 84;

export const useTabIndicator = (activeId: string) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = useState<
    Record<string, TabMeasuredLayout>
  >({});

  const indicatorX = useSharedValue(0);
  const opacity = useSharedValue(0);

  const activeLayout = tabLayouts[activeId];

  // Depend on the active tab's own x/width, not the whole tabLayouts map —
  // otherwise an unrelated tab reporting its layout restarts this animation.
  useEffect(() => {
    if (activeId && activeLayout) {
      const { x, width } = activeLayout;
      const targetX = x + (width - STATIC_WIDTH) / 2;

      indicatorX.value = withTiming(targetX, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, { duration: durations.fade });

      const screenWidth = Dimensions.get("window").width;
      const targetScrollX = x - (screenWidth - width) / 2;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, targetScrollX),
          animated: true,
        });
      }, 50);
    }
  }, [activeId, activeLayout, indicatorX, opacity]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: STATIC_WIDTH,
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
