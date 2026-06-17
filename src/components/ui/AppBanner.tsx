import React from "react";
import { View, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Touchable } from "./Touchable";
import { colors } from "@/src/theme/colors";
import { AppButton } from "./AppButton";

export type BannerVariant = "info" | "success" | "warning" | "error" | "pastel";

interface AppBannerProps {
  title: string;
  description?: string;
  variant?: BannerVariant;
  illustration?: React.ReactNode;
  onClose?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
  style?: ViewStyle;
}

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AppBanner: React.FC<AppBannerProps> = ({
  title,
  description,
  variant = "info",
  illustration,
  onClose,
  actionLabel,
  onActionPress,
  className = "",
  style,
}) => {
  // Styles for different variants
  const getBannerColors = () => {
    switch (variant) {
      case "success":
        return {
          bgClass: "bg-[#E6F2EB] border border-[#0F763533]",
          textColor: "text-[#0F7635]",
          descColor: "text-[#1B5E34]",
          closeColor: "#0F7635",
        };
      case "warning":
        return {
          bgClass: "bg-[#FFF9EB] border border-[#F59E0B33]",
          textColor: "text-[#D97706]",
          descColor: "text-[#B45309]",
          closeColor: "#D97706",
        };
      case "error":
        return {
          bgClass: "bg-[#FFEBEB] border border-[#DC262633]",
          textColor: "text-[#DC2626]",
          descColor: "text-[#B91C1C]",
          closeColor: "#DC2626",
        };
      case "pastel":
        return {
          bgClass: "border border-[#919EAB1A]",
          textColor: "text-[#222222]",
          descColor: "text-[#6A6A6A]",
          closeColor: "#6A6A6A",
          gradientColors: colors.gradients.savingsBanner,
        };
      case "info":
      default:
        return {
          bgClass: "bg-[#EBF5FF] border border-[#2563EB33]",
          textColor: "text-[#1E40AF]",
          descColor: "text-[#1E3A8A]",
          closeColor: "#1E40AF",
        };
    }
  };

  const config = getBannerColors();
  const isPastel = variant === "pastel";

  const renderContent = () => (
    <View className="flex-row items-center w-full">
      {illustration && <View className="mr-3">{illustration}</View>}
      <View className="flex-1 mr-2">
        <Text className={`font-inter-semibold text-sm ${config.textColor}`}>
          {title}
        </Text>
        {description && (
          <Text className={`font-inter text-xs mt-0.5 ${config.descColor}`}>
            {description}
          </Text>
        )}
        {actionLabel && onActionPress && (
          <AppButton
            title={actionLabel}
            onPress={onActionPress}
            size="sm"
            variant={variant === "pastel" ? "primary" : "outline"}
            className="mt-2.5 self-start py-1 px-3"
            textClassName="text-xs"
          />
        )}
      </View>
      {onClose && (
        <Touchable
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="self-start mt-0.5"
        >
          <CloseIcon color={config.closeColor} />
        </Touchable>
      )}
    </View>
  );

  if (isPastel && config.gradientColors) {
    return (
      <LinearGradient
        colors={config.gradientColors as any}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={style}
        className={`flex-row items-center rounded-xl p-4 ${config.bgClass} ${className}`}
      >
        {renderContent()}
      </LinearGradient>
    );
  }

  return (
    <View
      style={style}
      className={`flex-row items-center rounded-xl p-4 ${config.bgClass} ${className}`}
    >
      {renderContent()}
    </View>
  );
};
