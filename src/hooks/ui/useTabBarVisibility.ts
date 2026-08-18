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

// Top clearance before downward scroll is allowed to hide the tab bar.
const HIDE_AFTER = 40;
// Finger scroll distance required for a complete 0 -> 1 or 1 -> 0 transition.
const TRAVEL_DISTANCE = 65;
// Snappy settle duration when snapping to 0 or 1 on touch/momentum end.
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

      // Reaching top of feed locks tab bar to fully visible.
      if (currentScrollY <= 0) {
        lastScrollY.value = currentScrollY;
        tabBarVisible.value = 1;
        if (isTabBarVisibleShared.value !== 1) {
          isTabBarVisibleShared.value = 1;
          runOnJS(applyVisibility)(true);
        }
        return;
      }

      // Reaching the end of scrollable content reveals the tab bar.
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

      // Ignore sub-pixel noise to avoid jitter.
      if (Math.abs(deltaY) < 0.5) return;

      // Prevent accidental hiding within the top clearance area.
      if (currentScrollY <= HIDE_AFTER && deltaY > 0) {
        tabBarVisible.value = 1;
        if (isTabBarVisibleShared.value !== 1) {
          isTabBarVisibleShared.value = 1;
          runOnJS(applyVisibility)(true);
        }
        return;
      }

      // 1:1 Continuous scroll tracking on UI thread.
      const nextProgress = Math.min(
        1,
        Math.max(0, tabBarVisible.value - deltaY / TRAVEL_DISTANCE),
      );
      tabBarVisible.value = nextProgress;
    },

    onEndDrag: (event) => {
      // If drag finishes without momentum, settle immediately to nearest state.
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
