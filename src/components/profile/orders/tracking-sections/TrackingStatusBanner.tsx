import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

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
      className="mx-base rounded-md"
      style={{
        backgroundColor: isCancelled ? "#FEF2F2" : "#FFFBE8",
        borderWidth: 1,
        borderColor: isCancelled ? "#FECACA" : "#FDE047",
        paddingHorizontal: exactScale(16),
        paddingVertical: exactScale(12),
      }}
    >
      <Text
        className="font-inter-semibold"
        style={{
          fontSize: moderateScale(13),
          color: isCancelled ? "#DC2626" : "#92600A",
        }}
      >
        {isCancelled
          ? `Order cancelled: ${cancellationReason}`
          : "Your order is delayed"}
      </Text>
      {!isCancelled && (
        <Text
          className="font-inter mt-1"
          style={{ fontSize: moderateScale(12), color: "#92600A" }}
        >
          It&apos;s past the expected delivery date — we&apos;re on it.
        </Text>
      )}
    </View>
    
  );
}
