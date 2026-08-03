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
  /** Details, settings and edit flows use platform-native push/pop motion. */
  nativePush: {
    animation: "fade",
    animationDuration: 250,
    gestureEnabled: true,
    contentStyle: { backgroundColor: "#FFFFFF" },
    freezeOnBlur: true,
  },
  /** Splash and neutral context replacements. */
  fade: {
    animation: "fade",
    animationDuration: 120,
    freezeOnBlur: true,
  },
  /** Auth completion uses native fade with subtle depth. */
  authComplete: {
    animation: "fade_from_bottom",
    animationDuration: 250,
    freezeOnBlur: true,
  },
  /** Navigation-owned modal screens slide up and support native dismissal. */
  modal: {
    presentation: "modal",
    animation: "slide_from_bottom",
    animationDuration: 250,
    gestureEnabled: true,
    freezeOnBlur: true,
  },
  /** Terminal success/error screens do not imply deeper hierarchy. */
  result: {
    animation: "fade",
    animationDuration: 220,
    gestureEnabled: false,
    contentStyle: { backgroundColor: "#FFFFFF" },
    freezeOnBlur: false,
  },
  /** Guard redirects — an auth bounce is not a navigation the user made, so it shouldn't animate like one. */
  none: {
    animation: "none",
    freezeOnBlur: true,
  },
} as const;
