import React from "react";
import { ActivityIndicator, Text, View, ViewStyle, TextStyle } from "react-native";
import { Touchable } from "./Touchable";
import { colors } from "@/src/theme/colors";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  textClassName?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  throttleMs?: number;
  activeOpacity?: number;
  children?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  textClassName = "",
  style,
  textStyle,
  throttleMs = 500,
  activeOpacity = 0.85,
  children,
}) => {
  // Variant container classes
  const getVariantContainerClass = () => {
    switch (variant) {
      case "primary":
        return "bg-[#0F7635] border border-[#0F7635]";
      case "secondary":
        return "bg-[#FACA15] border border-[#FACA15]";
      case "outline":
        return "bg-transparent border border-[#0F7635]";
      case "ghost":
        return "bg-transparent border border-transparent";
      case "danger":
        return "bg-[#DC2626] border border-[#DC2626]";
      default:
        return "bg-[#0F7635] border border-[#0F7635]";
    }
  };

  // Variant text color classes
  const getVariantTextClass = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return "text-white font-inter-semibold";
      case "secondary":
        return "text-[#222222] font-inter-semibold";
      case "outline":
      case "ghost":
        return "text-[#0F7635] font-inter-semibold";
      default:
        return "text-white font-inter-semibold";
    }
  };

  // Size padding classes
  const getSizeContainerClass = () => {
    switch (size) {
      case "sm":
        return "py-2 px-3 rounded-md";
      case "lg":
        return "py-4.5 px-6 rounded-xl";
      case "md":
      default:
        return "py-3.5 px-5 rounded-lg";
    }
  };

  // Size text scale classes
  const getSizeTextClass = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      case "md":
      default:
        return "text-base";
    }
  };

  // Spinner indicator color matching the variant
  const getSpinnerColor = () => {
    switch (variant) {
      case "outline":
      case "ghost":
        return colors.brand.primary;
      case "secondary":
        return "#222222";
      case "primary":
      case "danger":
      default:
        return "#FFFFFF";
    }
  };

  const isBtnDisabled = disabled || loading;

  return (
    <Touchable
      onPress={onPress}
      disabled={isBtnDisabled}
      throttleMs={throttleMs}
      activeOpacity={activeOpacity}
      className={`flex-row items-center justify-center ${getVariantContainerClass()} ${getSizeContainerClass()} ${
        isBtnDisabled ? "opacity-60" : ""
      } ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <View className="flex-row items-center justify-center">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          {children ? (
            children
          ) : (
            <Text
              className={`${getVariantTextClass()} ${getSizeTextClass()} text-center ${textClassName}`}
              style={textStyle}
            >
              {title}
            </Text>
          )}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
      )}
    </Touchable>
  );
};
