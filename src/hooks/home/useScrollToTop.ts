import { useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import Animated, { AnimatedRef } from "react-native-reanimated";

export const SCROLL_TO_TOP_EVENT = "home-scroll-to-top";

export function useScrollToTop(scrollViewRef: AnimatedRef<Animated.ScrollView>) {
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(SCROLL_TO_TOP_EVENT, () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => sub.remove();
  }, []);
}
