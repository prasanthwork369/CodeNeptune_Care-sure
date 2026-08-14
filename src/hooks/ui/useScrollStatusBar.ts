import { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * should just always be solid.
 */
export const useScrollStatusBar = (
  scrollY: SharedValue<number>,
  revealAfter?: SharedValue<number>,
) => {
  const insets = useSafeAreaInsets();

  const safeAreaBgStyle = useAnimatedStyle(() => {
    const threshold = revealAfter
      ? revealAfter.value > 0
        ? revealAfter.value
        : 200
      : 0;
    const shouldShow = revealAfter
      ? scrollY.value >= threshold
      : true;
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
