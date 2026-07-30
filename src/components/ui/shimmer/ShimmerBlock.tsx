import React, { memo } from "react";
import { DimensionValue, StyleProp, View, ViewStyle } from "react-native";
import { ShimmerOverlay, ShimmerOverlayProps } from "./ShimmerOverlay";

export interface ShimmerBlockProps extends Pick<
  ShimmerOverlayProps,
  "duration" | "enabled"
> {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Sized placeholder primitive for text lines, images, cards, rows, and banners.
 * Supply the final component's dimensions to guarantee zero layout shift.
 */
export const ShimmerBlock = memo(function ShimmerBlock({
  width = "100%",
  height,
  borderRadius = 4,
  duration,
  enabled,
  style,
}: ShimmerBlockProps) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: "hidden",
          backgroundColor: "#E8EAED",
        },
        style,
      ]}
    >
      <ShimmerOverlay
        borderRadius={borderRadius}
        duration={duration}
        enabled={enabled}
      />
    </View>
  );
});
