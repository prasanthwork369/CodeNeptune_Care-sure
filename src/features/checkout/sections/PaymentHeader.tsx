import { icons } from "@/src/constants/icons";
import type { PaymentHeaderProps } from "../types";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./PaymentHeader.styles";

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  onBack,
  title,
}) => {
  return (
    <View style={s.headerRow}>
      <Touchable onPress={onBack} style={s.backBtn}>
        <icons.arrow_back width={20} height={20} fill="#1A1C1E" />
      </Touchable>
      <Text style={s.title}>{title}</Text>
      <View style={s.spacer} />
    </View>
  );
};
