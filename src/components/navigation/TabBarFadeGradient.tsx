import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

export const TabBarFadeGradient: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();

  // Tops out just under the pill so the glass keeps live content behind its full height
  const extraHeight = exactScale(4);

  // Solid white overhang below the screen edge, matching BannerFadeGradient.
  // Without it the gradient's opaque end is the first thing to leave the
  // screen when the bar hides, collapsing the fade into a hard cropped edge.
  // Added to the offset and the height equally, so the visible top edge —
  // and therefore the resting appearance — is unchanged.
  const OVERHANG = exactScale(100);
  const visibleHeight = adjustedBottom + extraHeight;
  const totalHeight = visibleHeight + OVERHANG;
  // Fraction of the gradient that sits on screen; the rest hangs below.
  const edge = visibleHeight / totalHeight;

  return (
    <LinearGradient
      colors={[
        "rgba(255,255,255,0)",
        "rgba(255,255,255,0.90)",
        "#FFFFFF",
        "#FFFFFF",
      ]}
      // The first three stops keep the original ramp on the exact same pixels;
      // the fourth holds solid white all the way down through the overhang.
      locations={[0.1 * edge, 0.2 * edge, edge, 1]}
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: -OVERHANG,
        left: 0,
        right: 0,
        height: totalHeight,
      }}
    />
  );
};
