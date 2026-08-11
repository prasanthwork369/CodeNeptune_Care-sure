import React from "react";
import { View, Text } from "react-native";
import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
import { ChooseMethodFooterProps } from "@/src/types/prescription";
import { moderateScale } from "@/src/utils/exactScale";

export const ChooseMethodFooter: React.FC<ChooseMethodFooterProps> = ({
  toPay,
  safeAreaBottom,
  canProceed,
  onProceed,
  buttonLabel,
}) => {
  return (
    <StickyFooter
      safeAreaBottom={safeAreaBottom}
      contentStyle={{ flexDirection: "row", alignItems: "center" }}
    >
      <View>
        <Text
          className="font-inter-medium text-brand-text"
          style={{ fontSize: moderateScale(11) }}
        >
          To Pay
        </Text>
        <Text
          className="font-inter-extrabold text-brand-text"
          style={{ fontSize: moderateScale(18) }}
        >
          ₹{Number(toPay).toFixed(2)}
        </Text>
      </View>
      <AppButton
        title={buttonLabel}
        onPress={onProceed}
        disabled={!canProceed}
        style={{ flex: 1, marginLeft: 40 }}
      />
    </StickyFooter>
  );
};
