import { makeMutable } from "react-native-reanimated";

/**
 * UI-thread mirror of `uiStore.isFeedScrolling`.
 *
 * Decorative animations pause while the feed scrolls. Reading that from the
 * store made every offer badge on screen re-render at touch-down — a burst of
 * React work at the exact moment the finger lands, which reads as a sticky tap.
 * Reading it here instead pauses them on the UI thread with no render at all.
 */
export const feedScrolling = makeMutable(false);
