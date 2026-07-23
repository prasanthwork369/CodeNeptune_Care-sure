import { AppButton } from "@/src/components/ui/AppButton";
import { CartFooterProps } from "@/src/types/cart";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { cartStyles as s } from "../cart.styles";

export const CartFooter: React.FC<CartFooterProps> = ({
  toPay,
  safeAreaBottom,
  onProceed,
  canProceed = true,
}) => {
  const formattedTotal = Number(toPay).toFixed(2);

  return (
    <View
      className="bg-white border-t border-[#919EAB33] px-4 flex-row items-center"
      style={{
        paddingTop: exactScale(8),
        paddingBottom: safeAreaBottom + exactScale(8),
      }}
    >
      <View style={{ minWidth: exactScale(96) }}>
        <Text
          style={s.footerLabel}
          className="font-inter-medium text-brand-text"
        >
          To Pay
        </Text>
        <Text
          style={s.footerTotal}
          className="font-inter-extrabold text-brand-text"
          numberOfLines={1}
        >
          ₹{formattedTotal}
        </Text>
      </View>

      <AppButton
        title="Proceed to pay"
        onPress={onProceed}
        disabled={!canProceed}
        size="md"
        className="flex-1"
        style={{ marginLeft: exactScale(24) }}
        accessibilityLabel={`Proceed to pay ₹${formattedTotal}`}
        accessibilityHint="Continues to delivery and payment"
      />
    </View>
  );
};
