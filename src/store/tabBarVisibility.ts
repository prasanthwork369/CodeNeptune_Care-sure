import { makeMutable } from "react-native-reanimated";

/**
 * Global tab bar visibility: 1 = shown, 0 = hidden.
 *
 * Module-level rather than a hook's `useSharedValue`, because the scroll
 * handler and the tab bar live in different trees (a screen vs. the tabs
 * layout) and must share one instance. Writing it from the scroll worklet
 * keeps the whole hide/show animation on the UI thread — no runOnJS hop, no
 * React re-render, so a busy JS thread can never delay it.
 *
 * `uiStore.isTabBarVisible` mirrors this for consumers that need React state;
 * that mirror is allowed to lag since nothing animated reads it.
 */
export const tabBarVisible = makeMutable(1);
