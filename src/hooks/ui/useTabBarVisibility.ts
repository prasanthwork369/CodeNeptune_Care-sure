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
import { durations, easings } from "@/src/theme";

// Scroll distance before a downward scroll is allowed to hide the bar.
const HIDE_AFTER = 40;
// Ignores sub-pixel jitter so a resting finger can't flip-flop the bar.
const MIN_DELTA = 5;

/**
 * Shows/hides the bottom tab bar and collapses the upload button based on
 * scroll direction.
 *
 * The animation is driven by writing `tabBarVisible` from this worklet, so it
 * starts on the same frame as the scroll event. The `runOnJS` call only
 * mirrors state into the store for non-animated consumers — nothing visual
 * waits on it, so a busy JS thread can't delay the bar.
 */
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
    onScroll: (event) => {
      const currentScrollY = event.contentOffset.y;
      if (scrollY) {
        scrollY.value = currentScrollY;
      }
      const isAtBottom =
        currentScrollY + event.layoutMeasurement.height >=
        event.contentSize.height - 24;

      // Reaching the end of the scrollable content always reveals the
      // tab bar, even if the user got there by scrolling down.
      if (isAtBottom) {
        lastScrollY.value = currentScrollY;
        if (isTabBarVisibleShared.value !== 1) {
          isTabBarVisibleShared.value = 1;
          tabBarVisible.value = withTiming(1, {
            duration: durations.tabBar,
            easing: easings.standard,
          });
          runOnJS(applyVisibility)(true);
        }
        return;
      }

      const delta = currentScrollY - lastScrollY.value;

      if (Math.abs(delta) < MIN_DELTA) return;
      lastScrollY.value = currentScrollY;

      let nextVisible = isTabBarVisibleShared.value;
      if (currentScrollY <= 0) {
        nextVisible = 1;
      } else if (delta > 0 && currentScrollY > HIDE_AFTER) {
        nextVisible = 0;
      } else if (delta < 0) {
        nextVisible = 1;
      }

      if (nextVisible !== isTabBarVisibleShared.value) {
        isTabBarVisibleShared.value = nextVisible;
        // Starts here on the UI thread, in the same frame as the scroll event.
        tabBarVisible.value = withTiming(nextVisible, {
          duration: durations.tabBar,
          easing: easings.standard,
        });
        runOnJS(applyVisibility)(nextVisible === 1);
      }
    },
  });

  return { isTabBarVisibleShared, handleScroll };
};
