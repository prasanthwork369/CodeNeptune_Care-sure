import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
import { CartFooterProps } from "@/src/features/cart/types";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { cartStyles as s } from "../cart.styles";

export const CartFooter: React.FC<CartFooterProps> = ({
  toPay,
  safeAreaBottom,
  onProceed,
  canProceed = true,
  hasRxItem = false,
}) => {
  const formattedTotal = Number(toPay).toFixed(2);
  const buttonTitle = hasRxItem ? "Proceed to checkout" : "Proceed to pay";

  return (
    <StickyFooter
      safeAreaBottom={safeAreaBottom}
      contentStyle={{
        flexDirection: "row",
        alignItems: "center",
        maxWidth: undefined,
      }}
    >
      <View
        style={{
          flexBasis: "30%",
          minWidth: exactScale(76),
          maxWidth: exactScale(100),
          marginRight: exactScale(12),
        }}
      >
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
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          ₹{formattedTotal}
        </Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <AppButton
          title={buttonTitle}
          onPress={onProceed}
          disabled={!canProceed}
          size="md"
          style={{ width: "100%", paddingHorizontal: exactScale(8) }}
          accessibilityLabel={`${buttonTitle} ₹${formattedTotal}`}
          accessibilityHint="Continues to delivery and payment"
        />
      </View>
    </StickyFooter>
  );
};
