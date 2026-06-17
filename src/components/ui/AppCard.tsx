import React from "react";
import { View, ViewStyle } from "react-native";
import { Touchable } from "./Touchable";
import { shadows as shadowTokens } from "@/src/theme/shadows";

export type CardVariant = "default" | "flat" | "outlined";
export type CardShadow = "none" | "sm" | "md" | "lg" | "xl";
export type CardRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl";
export type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: CardVariant;
  shadow?: CardShadow;
  borderRadius?: CardRadius;
  padding?: CardPadding;
  border?: boolean;
  className?: string;
  style?: ViewStyle;
  activeOpacity?: number;
  throttleMs?: number;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  variant = "default",
  shadow,
  borderRadius = "md",
  padding = "md",
  border,
  className = "",
  style,
  activeOpacity = 0.95,
  throttleMs = 500,
}) => {
  // Determine shadow to apply based on variant & shadow prop
  const getShadowStyle = () => {
    const selectedShadow = shadow !== undefined ? shadow : (variant === "default" ? "sm" : "none");
    return shadowTokens[selectedShadow] || shadowTokens.none;
  };

  // Border radius styling
  const getRadiusClass = () => {
    switch (borderRadius) {
      case "none":
        return "rounded-none";
      case "sm":
        return "rounded-md"; // 10px in our system mapping
      case "lg":
        return "rounded-xl"; // 18px
      case "xl":
        return "rounded-2xl"; // 24px
      case "2xl":
        return "rounded-3xl"; // 32px
      case "md":
      default:
        return "rounded-lg"; // 14px
    }
  };

  // Padding styling
  const getPaddingClass = () => {
    switch (padding) {
      case "none":
        return "p-0";
      case "sm":
        return "p-2";
      case "lg":
        return "p-5";
      case "xl":
        return "p-6";
      case "md":
      default:
        return "p-4";
    }
  };

  // Variant classes
  const getVariantClass = () => {
    const isOutlined = border !== undefined ? border : variant === "outlined";
    switch (variant) {
      case "flat":
        return `bg-[#F9FAFB] ${isOutlined ? "border border-[#919EAB33]" : ""}`;
      case "outlined":
        return "bg-white border border-[#919EAB33]";
      case "default":
      default:
        return `bg-white ${isOutlined ? "border border-[#919EAB33]" : ""}`;
    }
  };

  const containerStyle = [
    getShadowStyle(),
    style,
  ];

  if (onPress) {
    return (
      <Touchable
        onPress={onPress}
        activeOpacity={activeOpacity}
        throttleMs={throttleMs}
        className={`${getVariantClass()} ${getRadiusClass()} ${getPaddingClass()} overflow-hidden ${className}`}
        style={containerStyle}
      >
        {children}
      </Touchable>
    );
  }

  return (
    <View
      className={`${getVariantClass()} ${getRadiusClass()} ${getPaddingClass()} overflow-hidden ${className}`}
      style={containerStyle}
    >
      {children}
    </View>
  );
};
