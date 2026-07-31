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
      className="bg-white border-t border-[#F3F4F6] flex-row items-center justify-between"
      style={{
        paddingTop: exactScale(12),
        paddingBottom: safeAreaBottom + exactScale(12),
        paddingHorizontal: exactScale(16),
        shadowColor: "#919EAB33",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 12,
      }}
    >
      <View style={{ marginRight: exactScale(12), minWidth: 0 }}>
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

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppButton
          title="Proceed to pay"
          onPress={onProceed}
          disabled={!canProceed}
          size="md"
          style={{ width: "100%", paddingHorizontal: exactScale(8) }}
          accessibilityLabel={`Proceed to pay ₹${formattedTotal}`}
          accessibilityHint="Continues to delivery and payment"
        />
      </View>
    </View>
  );
};
