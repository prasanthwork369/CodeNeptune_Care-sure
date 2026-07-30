import { SharedValue } from "react-native-reanimated";
import { useTabBarVisibility } from "../ui/useTabBarVisibility";
import { useStickySearchBar } from "../ui/useStickySearchBar";

/**
 * Combines the Home screen's scroll-driven animations:
 * - tab bar / upload button visibility (useTabBarVisibility)
 * - sticky search bar show/hide (useStickySearchBar)
 *
 * Each concern is implemented in its own hook so they can be fixed
 * independently without affecting one another.
 */
export const useHomeScroll = (
  scrollY: SharedValue<number>,
  heroHeightShared: SharedValue<number>,
) => {
  const { isTabBarVisibleShared, handleScroll: handleTabBarScroll } =
    useTabBarVisibility(scrollY);
  const { stickySearchVisible } = useStickySearchBar(scrollY, heroHeightShared);

  return {
    handleScroll: handleTabBarScroll,
    isTabBarVisibleShared,
    stickySearchVisible,
  };
};
