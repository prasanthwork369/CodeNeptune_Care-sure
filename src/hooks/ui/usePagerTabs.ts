import { useCallback, useState } from "react";
import { Dimensions } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type Animated from "react-native-reanimated";
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

/**
 * Drives a horizontal pager whose tabs and content share one scroll position.
 * Tab presses scroll the pager, and swipes move the indicator, so the two can
 * never disagree — the scroll offset is the only source of truth.
 */
export function usePagerTabs<T extends string>(
  keys: readonly T[],
  initialWidth = Dimensions.get("window").width,
) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const [pageWidth, setPageWidth] = useState(initialWidth);
  const [activeKey, setActiveKey] = useState<T>(keys[0]);
  // Pages mount only once reached, so unopened tabs never fetch.
  const [visitedKeys, setVisitedKeys] = useState<T[]>([keys[0]]);

  const markVisited = useCallback((key: T) => {
    setVisitedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const onScrollSettle = useCallback(
    (x: number) => {
      if (pageWidth <= 0) return;
      const index = Math.round(x / pageWidth);
      const key = keys[index];
      if (key !== undefined) {
        setActiveKey(key);
        markVisited(key);
      }
    },
    [keys, pageWidth, markVisited],
  );

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollSettle(e.nativeEvent.contentOffset.x);
    },
    [onScrollSettle],
  );

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocity = e.nativeEvent.velocity;
      // Settle immediately if there is no remaining momentum (velocity near 0).
      if (!velocity || Math.abs(velocity.x) < 0.1) {
        onScrollSettle(e.nativeEvent.contentOffset.x);
      }
    },
    [onScrollSettle],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  // Fractional page position, so the indicator can follow the finger.
  const progress = useDerivedValue(() =>
    pageWidth > 0 ? scrollX.value / pageWidth : 0,
  );

  // Label flips at the halfway point for active tab visual highlight.
  useAnimatedReaction(
    () => Math.round(progress.value),
    (index, previous) => {
      if (index === previous) return;
      const key = keys[index];
      if (key !== undefined) runOnJS(setActiveKey)(key);
    },
    [keys],
  );

  const goToTab = useCallback(
    (key: T) => {
      const index = keys.indexOf(key);
      if (index < 0 || pageWidth === 0) return;
      setActiveKey(key);
      markVisited(key);
      scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    },
    [keys, pageWidth, scrollRef, markVisited],
  );

  return {
    scrollRef,
    scrollHandler,
    handleMomentumScrollEnd,
    handleScrollEndDrag,
    progress,
    pageWidth,
    setPageWidth,
    activeKey,
    visitedKeys,
    goToTab,
  };
}
