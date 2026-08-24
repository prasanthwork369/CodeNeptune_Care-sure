import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

interface TabBarFadeGradientProps {
  visibleHeight?: number;
}

export const TabBarFadeGradient: React.FC<TabBarFadeGradientProps> = ({
  visibleHeight: customVisibleHeight,
}) => {
  const adjustedBottom = useAdjustedBottomInset();

  // Tops out just under the pill so the glass keeps live content behind its full height
  const extraHeight = exactScale(4);

  // Solid white overhang below the screen edge, matching BannerFadeGradient.
  // Without it the gradient's opaque end is the first thing to leave the
  // screen when the bar hides, collapsing the fade into a hard cropped edge.
  // Added to the offset and the height equally, so the visible top edge —
  // and therefore the resting appearance — is unchanged.
  const OVERHANG = exactScale(100);
  const visibleHeight = customVisibleHeight ?? adjustedBottom + extraHeight;
  const totalHeight = visibleHeight + OVERHANG;
  // Fraction of the gradient that sits on screen; the rest hangs below.
  const edge = visibleHeight / totalHeight;
  // The ramp below was tuned for the short default strip, where `edge` is
  // small and "fully opaque" lands within a few px of the top. Full-height
  // screens pass a much taller visibleHeight so this layer can back the
  // whole bar, but that inflates `edge` too — pushing "fully opaque" almost
  // to the bottom of the bar and leaving its top translucent, which is what
  // let screen content show through above the pill.
  const isFullBackdrop = customVisibleHeight != null;
  // Sized to roughly match the gap between the bar's top and the pill, so
  // the fade finishes right as it reaches the pill instead of stopping
  // short (a visible crop) or stretching most of the bar (the leak above).
  const fadeInEdge = Math.min(edge, exactScale(20) / totalHeight);
  // The default ramp's first stop starts a few px in, leaving a flat
  // fully-transparent lead-in — negligible on the short strip, but on the
  // narrower full-backdrop band that lead-in reads as a hard edge rather
  // than a fade. Starting at 0 keeps the ramp continuous from the very top.
  const locations: [number, number, number, number] = isFullBackdrop
    ? [0, 0.6 * fadeInEdge, fadeInEdge, 1]
    : [0.1 * edge, 0.2 * edge, edge, 1];

  return (
    <LinearGradient
      colors={[
        "rgba(255,255,255,0)",
        "rgba(255,255,255,0.75)",
        "#FFFFFF",
        "#FFFFFF",
      ]}
      // The first three stops keep the original ramp on the exact same pixels;
      // the fourth holds solid white all the way down through the overhang.
      locations={locations}
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
