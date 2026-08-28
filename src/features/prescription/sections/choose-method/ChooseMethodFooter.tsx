import React from "react";
import { View, Text } from "react-native";
import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
import { ChooseMethodFooterProps } from "@/src/features/prescription/types";
import { styles as s } from "./choose-method.styles";

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
      contentStyle={s.footerContent}
    >
      <View>
        <Text style={s.toPayLabel}>
          To Pay
        </Text>
        <Text style={s.toPayAmount}>
          ₹{Number(toPay).toFixed(2)}
        </Text>
      </View>
      <AppButton
        title={buttonLabel}
        onPress={onProceed}
        disabled={!canProceed}
        style={s.proceedBtn}
      />
    </StickyFooter>
  );
};
