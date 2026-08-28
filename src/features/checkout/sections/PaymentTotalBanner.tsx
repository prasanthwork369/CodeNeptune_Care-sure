import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import VerifiedUserWhiteIcon from "@/assets/icons/VerifiedUserWhiteIcon.svg";
import type { PaymentTotalBannerProps } from "../types";
import { styles as s } from "./PaymentTotalBanner.styles";

export const PaymentTotalBanner: React.FC<PaymentTotalBannerProps> = ({
  toPay,
}) => {
  return (
    <LinearGradient
      colors={["#0F7635", "#16A34A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.gradientCard}
    >
      <Text style={s.label}>Total Amount to Pay</Text>
      <View style={s.amountRow}>
        <Text style={s.currency}>₹</Text>
        <Text style={s.amount}>{toPay}</Text>
      </View>
      <View style={s.secureRow}>
        <VerifiedUserWhiteIcon width={16} height={16} />
        <Text style={s.secureText}>Safe & Secure Transaction</Text>
      </View>
    </LinearGradient>
  );
};
