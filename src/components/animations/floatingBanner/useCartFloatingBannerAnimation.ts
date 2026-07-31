import { useEffect, useCallback } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { exactScale } from "@/src/utils/exactScale";
import { tabBarVisible } from "@/src/store/tabBarVisibility";

interface UseCartFloatingBannerAnimationProps {
  visible?: boolean;
  totalItems: number;
  onInteractionChange?: (isInteracting: boolean) => void;
}

export const useCartFloatingBannerAnimation = ({
  visible,
  totalItems,
  onInteractionChange,
}: UseCartFloatingBannerAnimationProps) => {
  // Scaled to match the Remove button's width/position (exactScale(90)) so the
  // reveal geometry stays consistent across device widths, not just at 390px.
  const SLIDE_OFFSET = -exactScale(90);
  const DURATION = 250;
  const EASE_IN_OUT = Easing.inOut(Easing.ease);

  // isSlid as shared value — avoids React re-render on every slide gesture
  const isSlid = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(totalItems > 0 ? 1 : 0);
  const slideY = useSharedValue(totalItems > 0 ? 0 : 150);
  // The tab bar's own shared value — read directly so the banner reshapes on
  // the same frame as the bar rather than trailing it through a store update.
  const tabBarAnim = tabBarVisible;

  useEffect(() => {
    const isBannerVisible =
      visible !== undefined ? visible && totalItems > 0 : totalItems > 0;
    if (isBannerVisible) {
      opacity.value = withTiming(1, { duration: 220, easing: EASE_IN_OUT });
      translateX.value = 0;
      isSlid.value = 0;
      onInteractionChange?.(false);
      slideY.value = withSpring(0, {
        damping: 17,
        stiffness: 110,
        mass: 0.6,
      });
    } else {
      slideY.value = withSpring(150, {
        damping: 17,
        stiffness: 110,
        mass: 0.6,
      });
      opacity.value = withTiming(0, {
        duration: DURATION,
        easing: EASE_IN_OUT,
      });
    }
  }, [totalItems, visible, onInteractionChange]);

  const handleSlide = useCallback(() => {
    translateX.value = withTiming(SLIDE_OFFSET, { duration: DURATION });
    isSlid.value = 1;
    onInteractionChange?.(true);
  }, [onInteractionChange]);

  const handleSnapBack = useCallback(() => {
    if (!isSlid.value) return;
    translateX.value = withTiming(0, { duration: DURATION });
    isSlid.value = 0;
    onInteractionChange?.(false);
  }, [onInteractionChange]);

  const handleClosePress = useCallback(() => {
    if (isSlid.value) handleSnapBack();
    else handleSlide();
  }, [handleSlide, handleSnapBack]);

  const bannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const exact77 = exactScale(77);
  const exact12 = exactScale(12);

  // The upload button is always collapsed exactly when the bar is hidden, so
  // one value drives the whole reshape. Deriving it from a second, JS-driven
  // value would run the shrink on two clocks and read as a broken two-stage
  // animation.
  const containerStyle = useAnimatedStyle(() => ({
    paddingLeft: exact12,
    paddingRight: interpolate(tabBarAnim.value, [0, 1], [exact77, exact12]),
    transform: [{ translateY: slideY.value }],
    opacity: opacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(tabBarAnim.value, [0, 1], [10, 14]),
    paddingVertical: interpolate(tabBarAnim.value, [0, 1], [5, 7]),
  }));

  const buttonTextAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(tabBarAnim.value, [0, 1], [12, 13]),
  }));

  const itemCountAnimatedStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(tabBarAnim.value, [0, 1], [10, 11]),
  }));

  return {
    isSlid,
    handleSlide,
    handleSnapBack,
    handleClosePress,
    bannerStyle,
    containerStyle,
    buttonAnimatedStyle,
    buttonTextAnimatedStyle,
    itemCountAnimatedStyle,
    hideAnimationDuration: DURATION,
  };
};
