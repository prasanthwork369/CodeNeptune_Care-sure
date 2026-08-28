import { icons } from "@/src/constants/icons";
import { useUIStore } from "@/src/store/uiStore";
import { exactScale } from "@/src/utils/exactScale";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { styles as s } from "./NoInternetState.styles";

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
    <View style={s.container}>
      <View style={s.contentWrapper}>
        <View style={s.iconBox}>
          <icons.no_internet width={exactScale(262)} height={exactScale(204)} />
        </View>

        <Text style={s.titleText}>
          No Internet Connection
        </Text>

        <Text style={s.subtitleText}>
          Please check your network
        </Text>

        <AppButton
          title="Try again"
          loading={retrying}
          disabled={retrying}
          onPress={handleRetry}
          variant="outline"
          style={s.retryButton}
          textStyle={s.retryButtonText}
          accessibilityLabel="Try again"
          accessibilityHint="Attempts to load the content again"
        />
      </View>
    </View>
  );
};
