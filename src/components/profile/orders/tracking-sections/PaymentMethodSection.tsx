import { icons } from "@/src/constants/icons";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { orderStyles as s } from "../orders.styles";
import { SectionCard } from "./SectionCard";

export function PaymentMethodSection() {
  return (
    <SectionCard style={{ paddingHorizontal: exactScale(16), paddingVertical: exactScale(16) }}>
      <Text
        className="font-inter-semibold text-brand-text"
        style={{ fontSize: moderateScale(14), marginBottom: exactScale(12) }}
      >
        Payment Method
      </Text>
      <View className="flex-row items-center" style={{ gap: exactScale(12) }}>
        <View
          className="items-center justify-center bg-[#FFFFFF]"
          style={{ width: exactScale(40), height: exactScale(40) }}
        >
          <icons.credit_card width={exactScale(24)} height={exactScale(24)} fill="#0F7635" />
        </View>
        <View>
          <Text
            style={s.labelMd}
            className="font-inter-semibold text-brand-text"
          >
            Paid online
          </Text>
          <Text
            style={s.labelSm}
            className="font-inter-medium text-brand-subtext"
          >
            UPI / Netbanking
          </Text>
        </View>
      </View>
    </SectionCard>
  );
}
