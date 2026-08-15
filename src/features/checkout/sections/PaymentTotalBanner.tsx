import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import VerifiedUserWhiteIcon from "@/assets/icons/VerifiedUserWhiteIcon.svg";
import { PaymentTotalBannerProps } from "../types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const PaymentTotalBanner: React.FC<PaymentTotalBannerProps> = ({
  toPay,
}) => {
  return (
    <LinearGradient
      colors={["#0F7635", "#16A34A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 24,
        padding: exactScale(24),
        marginBottom: exactScale(24),
        shadowColor: "#0F7635",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      <Text
        style={{
          fontSize: moderateScale(14),
          fontWeight: "500",
          color: "rgba(255,255,255,0.8)",
          letterSpacing: 0.5,
        }}
      >
        Total Amount to Pay
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          marginTop: exactScale(8),
        }}
      >
        <Text
          style={{
            fontSize: moderateScale(24),
            fontWeight: "700",
            color: "#fff",
            marginRight: exactScale(4),
          }}
        >
          ₹
        </Text>
        <Text
          style={{
            fontSize: moderateScale(42),
            fontWeight: "800",
            color: "#fff",
          }}
        >
          {toPay}
        </Text>
      </View>
      <View
        style={{
          marginTop: exactScale(16),
          paddingTop: exactScale(16),
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.15)",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <VerifiedUserWhiteIcon width={16} height={16} />
        <Text
          style={{
            fontSize: moderateScale(12),
            fontWeight: "600",
            color: "#fff",
            marginLeft: exactScale(8),
          }}
        >
          Safe & Secure Transaction
        </Text>
      </View>
    </LinearGradient>
  );
};
