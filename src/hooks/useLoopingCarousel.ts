import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";
import {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AUTOPLAY_INTERVAL_MS = 4000;
// Delay the first auto-advance past the 5s confetti duration so it never
// auto-swipes away from the first slide mid-celebration, before the user has
// even had a chance to read it.
const AUTOPLAY_START_DELAY_MS = 5500;

interface UseLoopingCarouselParams {
  isOpen: boolean;
  isLooping: boolean;
  slideWidth: number;
  slideCount: number;
}

// Drives a "duplicate-slide" infinite-loop carousel: [dummy copy of page B,
// real A, real B, dummy copy of page A], with autoplay and height
// measurement baked in. The real pages always live at index 1 and 2.
export function useLoopingCarousel({
  isOpen,
  isLooping,
  slideWidth,
  slideCount,
}: UseLoopingCarouselParams) {
  const scrollViewRef = useRef<ScrollView>(null);
  const progress = useSharedValue(0);

  const [activePageIndex, setActivePageIndex] = useState(1);
  // isInteractingRef is a ref (not state) on purpose -- flagging a drag must
  // never trigger a re-render, since that's what made the swipe feel
  // disconnected from the finger.
  const isInteractingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentScrollX = useRef(slideWidth);

  // Measured from real slide content instead of a guessed constant, so the
  // card always fits whichever slide is tallest with no dead space.
  const [pageHeight, setPageHeight] = useState(0);
  // Card stays invisible until EVERY slide has reported its height, then
  // fades in -- revealing after only the first measurement still let the
  // card grow when a taller slide landed, flashing white at the bottom.
  const measuredSlides = useRef(new Set<number>());
  const [allMeasured, setAllMeasured] = useState(false);
  const cardOpacity = useSharedValue(0);
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      progress.value = (event.contentOffset.x - slideWidth) / slideWidth;
    },
  });

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isLooping && isOpen && !isInteractingRef.current) {
      timerRef.current = setInterval(() => {
        // Re-checked at fire time (not just at schedule time) so a timer
        // queued just before a touch-down never fights the manual drag.
        if (isInteractingRef.current) return;
        setActivePageIndex((prev) => (prev === 2 ? 1 : 2));
      }, AUTOPLAY_INTERVAL_MS);
    }
  }, [isLooping, isOpen]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!(isLooping && isOpen)) {
      stopAutoplay();
      return;
    }
    const initialDelay = setTimeout(startAutoplay, AUTOPLAY_START_DELAY_MS);
    return () => {
      clearTimeout(initialDelay);
      stopAutoplay();
    };
  }, [isLooping, isOpen, startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (!isLooping) return;
    const targetX = activePageIndex * slideWidth;
    if (Math.abs(currentScrollX.current - targetX) > 5) {
      scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
      currentScrollX.current = targetX;
    }
  }, [activePageIndex, isLooping, slideWidth]);

  // Jump straight to the first real page (index 1) once the modal is visible
  // -- without this the ScrollView starts on the leading dummy at index 0.
  useEffect(() => {
    if (isLooping && isOpen) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ x: slideWidth, animated: false });
      });
      currentScrollX.current = slideWidth;
      // Deferred a tick (not left synchronous-in-effect) — still lands
      // before the next paint, same as before.
      queueMicrotask(() => setActivePageIndex(1));
    }
  }, [isLooping, isOpen, slideWidth]);

  // A slide count change (e.g. a slide arriving late) means the final height
  // may change again -- re-measure before trusting it.
  useEffect(() => {
    measuredSlides.current.clear();
    // Deferred a tick (not left synchronous-in-effect) — still lands
    // before the next paint, same as before.
    queueMicrotask(() => setAllMeasured(false));
  }, [slideCount]);

  // Reveal the card only after every slide is measured, one frame later so
  // the height update and initial scroll-jump have already painted.
  useEffect(() => {
    if (!isOpen) {
      cardOpacity.value = 0;
      return;
    }
    if (allMeasured) {
      requestAnimationFrame(() => {
        cardOpacity.value = withTiming(1, { duration: 220 });
      });
    }
  }, [isOpen, allMeasured, cardOpacity]);

  const handleScrollEnd = useCallback(
    (offsetX: number) => {
      if (!isLooping) return;
      let pageIndex = Math.round(offsetX / slideWidth);

      if (pageIndex === 0) {
        // Landed on the leading dummy (copy of real page 2) -- snap forward.
        pageIndex = 2;
        scrollViewRef.current?.scrollTo({
          x: 2 * slideWidth,
          animated: false,
        });
        currentScrollX.current = 2 * slideWidth;
      } else if (pageIndex === 3) {
        // Landed on the trailing dummy (copy of real page 1) -- snap back.
        pageIndex = 1;
        scrollViewRef.current?.scrollTo({
          x: 1 * slideWidth,
          animated: false,
        });
        currentScrollX.current = 1 * slideWidth;
      } else {
        currentScrollX.current = pageIndex * slideWidth;
      }

      setActivePageIndex(pageIndex);
      startAutoplay();
    },
    [isLooping, slideWidth, startAutoplay],
  );

  const onScrollBeginDrag = useCallback(() => {
    isInteractingRef.current = true;
    stopAutoplay();
  }, [stopAutoplay]);

  const onScrollSettle = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isInteractingRef.current = false;
      handleScrollEnd(e.nativeEvent.contentOffset.x);
    },
    [handleScrollEnd],
  );

  const onSlideLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      const height = e.nativeEvent.layout.height;
      setPageHeight((h) => Math.max(h, height));
      measuredSlides.current.add(index);
      if (measuredSlides.current.size >= slideCount) {
        setAllMeasured(true);
      }
    },
    [slideCount],
  );

  return {
    scrollViewRef,
    progress,
    pageHeight,
    cardAnimatedStyle,
    scrollHandler,
    onScrollBeginDrag,
    onScrollEndDrag: onScrollSettle,
    onMomentumScrollEnd: onScrollSettle,
    onSlideLayout,
  };
}
