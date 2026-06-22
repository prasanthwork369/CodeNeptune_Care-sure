import { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Solid status-bar-height mask so scrolled content never shows through
 * behind the status bar icons.
 *
 * `revealAfter` — if a screen already paints that area itself while at rest
 * (e.g. a hero gradient that extends up behind the status bar), pass the
 * scroll distance after which that content scrolls out of view. The mask
 * stays fully invisible until then (avoiding a double-painted seam against
 * the hero's own gradient) and snaps to solid the instant it's crossed — no
 * fade, since a fade would itself show a mismatched blend for a moment.
 * Omit it (default 0) for screens with no such top content, where the mask
 * should just always be solid.
 */
export const useScrollStatusBar = (
  scrollY: SharedValue<number>,
  revealAfter?: SharedValue<number>,
) => {
  const insets = useSafeAreaInsets();

  const safeAreaBgStyle = useAnimatedStyle(() => {
    const threshold = revealAfter ? revealAfter.value : 0;
    const shouldShow = scrollY.value >= threshold || scrollY.value < 0;
    return {
      opacity: shouldShow ? 1 : 0,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: insets.top + 8.5,
      zIndex: 101,
    };
  });

  return { safeAreaBgStyle };
};
