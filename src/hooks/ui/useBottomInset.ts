import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Returns the platform-adjusted bottom safe-area inset used by the tab bar,
 * floating banners, and gradient overlay so they all stay consistent.
 *
 * - Android: uses the system-reported navigation inset
 * - iOS:     caps the home-indicator inset at `IOS_BOTTOM_CAP` to prevent
 *            the large gap that appears on modern iPhones with a home indicator
 *
 * Pass `extra` to add additional offset on top of the adjusted value.
 */

export const IOS_BOTTOM_CAP = 1;

export function getAdjustedBottom(rawBottom: number): number {
  if (Platform.OS === "android") {
    return Math.max(rawBottom, 0);
  }
  return Math.min(rawBottom, IOS_BOTTOM_CAP);
}

export const useBottomInset = (extra = 0) => {
  const { bottom } = useSafeAreaInsets();
  return bottom + extra;
};

/** Returns the tab-bar-aligned adjusted bottom inset (platform-aware). */
export const useAdjustedBottomInset = (extra = 0) => {
  const { bottom } = useSafeAreaInsets();
  return getAdjustedBottom(bottom) + extra;
};
