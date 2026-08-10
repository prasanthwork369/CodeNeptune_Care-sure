import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

// Only these two mean "not on screen". Anything else — including the null
// AppState.currentState Android reports at startup — counts as foreground, so a
// missing initial value can never leave an animation frozen forever.
const isForegroundState = (s: AppStateStatus | null): boolean =>
  s !== "background" && s !== "inactive";

/** True while the app is in the foreground. */
export function useIsAppForeground(): boolean {
  const [isForeground, setIsForeground] = useState(() =>
    isForegroundState(AppState.currentState),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s: AppStateStatus) =>
      setIsForeground(isForegroundState(s)),
    );
    return () => sub.remove();
  }, []);

  return isForeground;
}

/**
 * True only while this screen is focused AND the app is in the foreground.
 *
 * Home stays mounted across tab switches by design, so a component there keeps
 * running unless it checks both — focus alone still ticks in the user's pocket,
 * and AppState alone still ticks while they browse another tab.
 */
export function useIsVisible(): boolean {
  const isFocused = useIsFocused();
  // Both hooks must run every render — `&&` would short-circuit the second.
  const isForeground = useIsAppForeground();
  return isFocused && isForeground;
}

/**
 * setInterval that only ticks while the screen is visible, so decorative
 * carousels and text cyclers stop costing anything the moment they are off
 * screen. On low-end Android several of these running unseen is real load.
 */
export function useVisibleInterval(
  callback: () => void,
  ms: number,
  enabled: boolean = true,
): void {
  const visible = useIsVisible();
  // Held in a ref so a new closure each render doesn't restart the timer.
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!visible || !enabled || ms <= 0) return;
    const id = setInterval(() => savedCallback.current(), ms);
    return () => clearInterval(id);
  }, [visible, enabled, ms]);
}
