import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./tracking.styles";

interface TrackingStatusBannerProps {
  delayed: boolean;
  cancellationReason: string | null;
}

export function TrackingStatusBanner({
  delayed,
  cancellationReason,
}: TrackingStatusBannerProps) {
  if (!delayed && !cancellationReason) return null;

  const isCancelled = !!cancellationReason;

  return (
    <View
      style={[
        s.statusBanner,
        isCancelled ? s.bannerCancelled : s.bannerDelayed,
      ]}
    >
      <Text
        style={[
          s.bannerTitle,
          isCancelled ? s.bannerTitleCancelled : s.bannerTitleDelayed,
        ]}
      >
        {isCancelled
          ? `Order cancelled: ${cancellationReason}`
          : "Your order is delayed"}
      </Text>
      {!isCancelled && (
        <Text style={s.bannerDesc}>
          It&apos;s past the expected delivery date — we&apos;re on it.
        </Text>
      )}
    </View>
  );
}
