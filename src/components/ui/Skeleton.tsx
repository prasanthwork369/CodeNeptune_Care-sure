import React from "react";
import { ViewStyle } from "react-native";
import { ShimmerBlock } from "./shimmer";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
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
      width={width as any}
      height={height as any}
      borderRadius={borderRadius}
      style={style}
    />
  );
};
