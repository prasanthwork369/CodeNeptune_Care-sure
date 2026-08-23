import { icons } from "@/src/constants/icons";
import { useUIStore } from "@/src/store/uiStore";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AppButton } from "./AppButton";

interface NoInternetStateProps {
  onRetry: () => void;
  retrying?: boolean;
}

export const NoInternetState: React.FC<NoInternetStateProps> = ({
  onRetry,
  retrying = false,
}) => {
  useEffect(() => {
    useUIStore.getState().setSuppressNetworkToast(true);
    return () => {
      useUIStore.getState().setSuppressNetworkToast(false);
    };
  }, []);

  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: [{ translateY: exactScale(-10) }],
        }}
      >
        <View
          style={{
            width: exactScale(262),
            height: exactScale(204),
            alignItems: "center",
            justifyContent: "center",
            marginBottom: exactScale(30),
          }}
        >
          <icons.no_internet width={exactScale(262)} height={exactScale(204)} />
        </View>

        <Text
          className="font-inter-semibold text-black text-center"
          style={{
            fontSize: moderateScale(18),
            lineHeight: moderateScale(20),
          }}
        >
          No Internet Connection
        </Text>

        <Text
          className="font-inter-medium text-[#6A6A6A] text-center"
          style={{
            fontSize: moderateScale(14),
            lineHeight: moderateScale(22),
            marginTop: exactScale(6),
          }}
        >
          Please check your network
        </Text>

        <AppButton
          title="Try again"
          loading={retrying}
          disabled={retrying}
          onPress={handleRetry}
          variant="outline"
          style={{
            width: exactScale(137),
            height: moderateScale(14) * 2.8,
            borderRadius: exactScale(6),
            marginTop: exactScale(15),
            borderWidth: 1,
            borderColor: "#0F7635",
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1,
          }}
          textStyle={{
            fontSize: moderateScale(14),
            color: "#0F7635",
          }}
          accessibilityLabel="Try again"
          accessibilityHint="Attempts to load the content again"
        />
      </View>
    </View>
  );
};
