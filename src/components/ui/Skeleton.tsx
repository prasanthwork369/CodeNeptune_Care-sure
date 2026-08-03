import React from "react";
import { DimensionValue, ViewStyle } from "react-native";
import { ShimmerBlock } from "./shimmer";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
}) => {
  return (
    <ShimmerBlock
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  );
};
