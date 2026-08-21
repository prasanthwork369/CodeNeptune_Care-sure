import React from "react";
import { Text, View } from "react-native";
import { icons } from "@/src/constants/icons";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { AppButton } from "./AppButton";

interface NoInternetStateProps {
  onRetry: () => void;
  retrying?: boolean;
}

/**
 * Reusable in-screen state for a query that failed because the device has no
 * internet connection. Any screen whose data fetch can fail offline can drop
 * this in instead of inventing its own copy/layout — see ProductDetailsLayout
 * for the reference usage (branch on the failed query's AppError kind).
 */
export const NoInternetState: React.FC<NoInternetStateProps> = ({
  onRetry,
  retrying = false,
}) => (
  <View className="flex-1 items-center justify-center px-8 py-12">
    <View
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#F4EAD3",
        borderWidth: 1.5,
        borderColor: "#FFEAC3",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: exactScale(18),
      }}
    >
      <icons.internet width={30} height={30} />
    </View>
    <Text
      className="font-inter-semibold text-[#222222] text-center"
      style={{ fontSize: moderateScale(17) }}
    >
      No internet connection
    </Text>
    <Text
      className="font-inter-regular text-[#6A6A6A] text-center"
      style={{ fontSize: moderateScale(13), marginTop: exactScale(6) }}
    >
      Please check your connection and try again.
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
