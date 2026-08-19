import { useCallback } from "react";
import {
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useUIStore } from "@/src/store/uiStore";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { easings } from "@/src/theme";

// Clearance before tab bar can hide
const HIDE_AFTER = 40;
// Scroll transition distance
const TRAVEL_DISTANCE = 65;
// Settle animation duration
const SETTLE_DURATION = 180;

export const useTabBarVisibility = (scrollY?: SharedValue<number>) => {
  const lastScrollY = useSharedValue(0);
  const isTabBarVisibleShared = useSharedValue(1);

  const applyVisibility = useCallback((visible: boolean) => {
    useUIStore.setState({
      isTabBarVisible: visible,
      isUploadButtonCollapsed: !visible,
    });
  }, []);

  const handleScroll = useAnimatedScrollHandler({
    onBeginDrag: (event) => {
      lastScrollY.value = event.contentOffset.y;
    },

    onScroll: (event) => {
      const currentScrollY = event.contentOffset.y;
      if (scrollY) {
        // eslint-disable-next-line react-hooks/immutability
        scrollY.value = currentScrollY;
      }

      // Locked to visible at top of scroll
      if (currentScrollY <= 0) {
        lastScrollY.value = currentScrollY;
        tabBarVisible.value = 1;
        if (isTabBarVisibleShared.value !== 1) {
          isTabBarVisibleShared.value = 1;
          runOnJS(applyVisibility)(true);
        }
        return;
      }

      // Reveal tab bar at scroll bottom
      const isAtBottom =
        currentScrollY + event.layoutMeasurement.height >=
        event.contentSize.height - 24;

      if (isAtBottom) {
        lastScrollY.value = currentScrollY;
        tabBarVisible.value = 1;
        if (isTabBarVisibleShared.value !== 1) {
          isTabBarVisibleShared.value = 1;
          runOnJS(applyVisibility)(true);
        }
        return;
      }

      const deltaY = currentScrollY - lastScrollY.value;
      lastScrollY.value = currentScrollY;

      // Ignore jitter
      if (Math.abs(deltaY) < 0.5) return;

      // Prevent hiding in top clearance area
      if (currentScrollY <= HIDE_AFTER && deltaY > 0) {
        tabBarVisible.value = 1;
        if (isTabBarVisibleShared.value !== 1) {
          isTabBarVisibleShared.value = 1;
          runOnJS(applyVisibility)(true);
        }
        return;
      }

      // Continuous tracking on UI thread
      const nextProgress = Math.min(
        1,
        Math.max(0, tabBarVisible.value - deltaY / TRAVEL_DISTANCE),
      );
      tabBarVisible.value = nextProgress;
    },

    onEndDrag: (event) => {
      // Settle if no momentum remains
      const hasVelocity = Math.abs(event.velocity?.y ?? 0) > 0.1;
      if (!hasVelocity) {
        const target =
          lastScrollY.value <= HIDE_AFTER
            ? 1
            : tabBarVisible.value >= 0.5
              ? 1
              : 0;

        if (tabBarVisible.value !== target) {
          tabBarVisible.value = withTiming(
            target,
            { duration: SETTLE_DURATION, easing: easings.standard },
            (finished) => {
              if (finished && isTabBarVisibleShared.value !== target) {
                isTabBarVisibleShared.value = target;
                runOnJS(applyVisibility)(target === 1);
              }
            },
          );
        } else if (isTabBarVisibleShared.value !== target) {
          isTabBarVisibleShared.value = target;
          runOnJS(applyVisibility)(target === 1);
        }
      }
    },

    onMomentumEnd: () => {
      const target =
        lastScrollY.value <= HIDE_AFTER
          ? 1
          : tabBarVisible.value >= 0.5
            ? 1
            : 0;

      if (tabBarVisible.value !== target) {
        tabBarVisible.value = withTiming(
          target,
          { duration: SETTLE_DURATION, easing: easings.standard },
          (finished) => {
            if (finished && isTabBarVisibleShared.value !== target) {
              isTabBarVisibleShared.value = target;
              runOnJS(applyVisibility)(target === 1);
            }
          },
        );
      } else if (isTabBarVisibleShared.value !== target) {
        isTabBarVisibleShared.value = target;
        runOnJS(applyVisibility)(target === 1);
      }
    },
  });

  return { isTabBarVisibleShared, handleScroll };
};
