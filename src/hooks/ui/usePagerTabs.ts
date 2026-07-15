import { useCallback, useState } from "react";
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
export function usePagerTabs<T extends string>(keys: readonly T[]) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeKey, setActiveKey] = useState<T>(keys[0]);
  // Pages mount only once reached, so unopened tabs never fetch.
  const [visitedKeys, setVisitedKeys] = useState<T[]>([keys[0]]);

  const markVisited = useCallback((key: T) => {
    setVisitedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const onActiveKeyChange = useCallback(
    (key: T) => {
      setActiveKey(key);
      markVisited(key);
    },
    [markVisited],
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

  // Label flips at the halfway point, matching standard pagers.
  useAnimatedReaction(
    () => Math.round(progress.value),
    (index, previous) => {
      if (index === previous) return;
      const key = keys[index];
      if (key !== undefined) runOnJS(onActiveKeyChange)(key);
    },
    [keys, onActiveKeyChange],
  );

  const goToTab = useCallback(
    (key: T) => {
      const index = keys.indexOf(key);
      if (index < 0 || pageWidth === 0) return;
      scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    },
    [keys, pageWidth, scrollRef],
  );

  return {
    scrollRef,
    scrollHandler,
    progress,
    pageWidth,
    setPageWidth,
    activeKey,
    visitedKeys,
    goToTab,
  };
}
