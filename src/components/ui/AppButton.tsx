import React from "react";
import {
  ActivityIndicator,
  Text,
  View,
  ViewStyle,
  TextStyle,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";
import { Touchable } from "./Touchable";
import { colors } from "@/src/theme/colors";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "danger";
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
  // Standard accessibility & testing props forwarded to the underlying Touchable
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: TouchableOpacityProps["accessibilityRole"];
  accessibilityState?: TouchableOpacityProps["accessibilityState"];
  hitSlop?: TouchableOpacityProps["hitSlop"];
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
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
  hitSlop,
}) => {
  // Variant container classes (excluding padding and border radius which are scaled below)
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

  const sizeStyles = {
    sm: {
      height: exactScale(36),
      paddingHorizontal: exactScale(12),
      borderRadius: exactScale(6),
    },
    md: {
      height: exactScale(50),
      paddingHorizontal: exactScale(10),
      borderRadius: exactScale(10),
    },
    lg: {
      height: exactScale(56),
      paddingHorizontal: exactScale(24),
      borderRadius: exactScale(12),
    },
  };

  const textSizeStyles = {
    sm: {
      fontSize: moderateScale(13),
    },
    md: {
      fontSize: moderateScale(15),
    },
    lg: {
      fontSize: moderateScale(17),
    },
  };

  const combinedButtonStyle = StyleSheet.flatten([sizeStyles[size], style]);
  const combinedTextStyle = StyleSheet.flatten([
    textSizeStyles[size],
    textStyle,
  ]);

  return (
    <Touchable
      onPress={onPress}
      disabled={isBtnDisabled}
      throttleMs={throttleMs}
      activeOpacity={activeOpacity}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={accessibilityState ?? { disabled: isBtnDisabled }}
      hitSlop={hitSlop}
      className={`flex-row items-center justify-center ${getVariantContainerClass()} ${
        isBtnDisabled ? "opacity-60" : ""
      } ${className}`}
      style={combinedButtonStyle}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <View
          className="flex-row items-center justify-center"
          style={{ gap: exactScale(6) }}
        >
          {leftIcon && <View>{leftIcon}</View>}
          {children ? (
            children
          ) : (
            <Text
              className={`${getVariantTextClass()} text-center ${textClassName}`}
              style={combinedTextStyle}
            >
              {title}
            </Text>
          )}
          {rightIcon && <View>{rightIcon}</View>}
        </View>
      )}
    </Touchable>
  );
};
