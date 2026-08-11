import { AppButton } from "@/src/components/ui/AppButton";
import { StickyFooter } from "@/src/components/ui/StickyFooter";
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
    <StickyFooter
      safeAreaBottom={safeAreaBottom}
      contentStyle={{ flexDirection: "row", alignItems: "center" }}
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
          title="Proceed to pay"
          onPress={onProceed}
          disabled={!canProceed}
          size="md"
          style={{ width: "100%", paddingHorizontal: exactScale(8) }}
          accessibilityLabel={`Proceed to pay ₹${formattedTotal}`}
          accessibilityHint="Continues to delivery and payment"
        />
      </View>
    </StickyFooter>
  );
};
