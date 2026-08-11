import React from "react";
import { Text, View } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { AppButton } from "./AppButton";

interface RetryStateProps {
  onRetry: () => void;
  title?: string;
  message?: string;
  retrying?: boolean;
}

export const RetryState: React.FC<RetryStateProps> = ({
  onRetry,
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  retrying = false,
}) => (
  <View className="flex-1 items-center justify-center px-8 py-12">
    <Text
      className="font-inter-semibold text-[#222222] text-center"
      style={{ fontSize: moderateScale(17) }}
    >
      {title}
    </Text>
    <Text
      className="font-inter-regular text-[#6A6A6A] text-center"
      style={{ fontSize: moderateScale(13), marginTop: exactScale(6) }}
    >
      {message}
    </Text>
    <AppButton
      title="Retry"
      size="sm"
      loading={retrying}
      onPress={onRetry}
      style={{ width: exactScale(120), marginTop: exactScale(18) }}
      accessibilityHint="Attempts to load the content again"
    />
  </View>
);
