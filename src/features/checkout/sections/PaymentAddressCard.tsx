import { icons } from "@/src/constants/icons";
import type { PaymentAddressCardProps } from "../types";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./PaymentAddressCard.styles";

export const PaymentAddressCard: React.FC<PaymentAddressCardProps> = ({
  hasAddress,
  deliveryLabel,
  deliveryCity,
  onPress,
}) => {
  return (
    <View style={s.wrapper}>
      <Text style={s.heading}>Delivery Address</Text>
      <Touchable
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          s.card,
          hasAddress ? s.cardSelected : s.cardMissing,
        ]}
      >
        <View
          style={[
            s.iconBox,
            hasAddress ? s.iconBoxGreen : s.iconBoxRed,
          ]}
        >
          <icons.location_on
            width={24}
            height={24}
            fill={hasAddress ? "#0F7635" : "#EF4444"}
          />
        </View>
        <View style={s.infoCol}>
          <Text style={s.label}>
            {hasAddress
              ? (deliveryLabel ?? "Default Address")
              : "No Address Selected"}
          </Text>
          <Text style={s.subLabel} numberOfLines={1}>
            {hasAddress ? deliveryCity! : "Please select a delivery location"}
          </Text>
        </View>
        <View style={s.arrowBox}>
          <icons.arrow_forward_ios width={12} height={12} fill="#9CA3AF" />
        </View>
      </Touchable>
    </View>
  );
};
