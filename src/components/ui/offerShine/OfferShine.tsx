import { ShimmerOverlay } from "@/src/components/ui/shimmer";
import { useUIStore } from "@/src/store/uiStore";
import React, { memo, useEffect, useState } from "react";
import { AccessibilityInfo, StyleProp, ViewStyle } from "react-native";
import { Easing } from "react-native-reanimated";

export interface OfferShineProps {
  borderRadius?: number;
  /** Set false for badges outside a list's visible window. */
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Decorative badge wrapper over the shared native-thread shimmer primitive. */
export const OfferShine = memo(function OfferShine({
  borderRadius = 0,
  enabled = true,
  style,
}: OfferShineProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  // Every discounted card renders one of these, so a scrolling feed was running
  // 20+ looping gradient overlays at once. Subscribing here rather than in the
  // cards keeps the scroll toggle re-rendering only these leaves.
  const isFeedScrolling = useUIStore((s) => s.isFeedScrolling);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return (
    <ShimmerOverlay
      borderRadius={borderRadius}
      duration={820}
      pause={2800}
      highlightOpacity={0.35}
      angle={-20}
      bandWidthRatio={0.4}
      softEdges
      easing={Easing.linear}
      enabled={enabled && !reduceMotion && !isFeedScrolling}
      style={style}
    />
  );
});
