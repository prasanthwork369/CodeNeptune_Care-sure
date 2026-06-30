import { icons } from "@/src/constants/icons";
import { PaymentHeaderProps } from "@/src/types/payment";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Text, View } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  onBack,
  title,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
      }}
    >
      <Touchable
        onPress={onBack}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#919EAB33",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <icons.arrow_back width={20} height={20} fill="#1A1C1E" />
      </Touchable>
      <Text
        style={{ fontSize: moderateScale(18), fontWeight: "700", color: "#1A1C1E" }}
      >
        {title}
      </Text>
      <View style={{ width: 44 }} />
    </View>
  );
};
