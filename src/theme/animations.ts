import { Easing } from "react-native-reanimated";

export const durations = {
  fast: 150,
  normal: 200,
  slow: 300,
  fade: 150,
  // Tab bar and everything that rides with it (floating banners, dots) — one
  // value so they can't drift out of lockstep.
  tabBar: 200,
} as const;

export const easings = {
  out: Easing.out(Easing.exp),
  inOut: Easing.inOut(Easing.quad),
  standard: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

export const springs = {
  snappy: { damping: 20, stiffness: 200 },
  gentle: { damping: 15, stiffness: 100 },
  bouncy: { damping: 10, stiffness: 150 },
  tab: { damping: 20, stiffness: 200 },
} as const;

/**
 * Screen transition presets — spread into a Stack's `screenOptions` so every
 * navigator pushes at the same speed instead of each picking its own.
 * `freezeOnBlur` stops off-screen screens re-rendering behind the active one.
 */
export const screenTransitions = {
  /** Default push: horizontal slide, matching the platform back gesture. */
  push: {
    animation: "slide_from_right",
    animationDuration: 300,
    freezeOnBlur: true,
  },
  /** Overlays and tab-level swaps, where a slide would read as navigation. */
  fade: {
    animation: "fade",
    animationDuration: 180,
    freezeOnBlur: true,
  },
} as const;
