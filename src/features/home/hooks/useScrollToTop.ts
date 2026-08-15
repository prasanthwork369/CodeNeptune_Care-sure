import { RefObject, useEffect } from "react";
import { DeviceEventEmitter } from "react-native";

export const SCROLL_TO_TOP_EVENT = "home-scroll-to-top";

type ScrollToTopHandle = {
  scrollTo?: (options: { y: number; animated: boolean }) => void;
  scrollToOffset?: (options: { offset: number; animated: boolean }) => void;
};

export function useScrollToTop(scrollRef: RefObject<ScrollToTopHandle | null>) {
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(SCROLL_TO_TOP_EVENT, () => {
      if (scrollRef.current?.scrollToOffset) {
        scrollRef.current.scrollToOffset({ offset: 0, animated: true });
        return;
      }
      scrollRef.current?.scrollTo?.({ y: 0, animated: true });
    });
    return () => sub.remove();
  }, [scrollRef]);
}
