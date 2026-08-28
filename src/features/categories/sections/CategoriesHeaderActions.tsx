import React from "react";
import { View, Text } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { icons } from "@/src/constants/icons";
import { useCartRead } from "@/src/features/cart/hooks/useCartRead";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./CategoriesHeaderActions.styles";

export const CategoriesHeaderActions: React.FC = () => {
  const router = useNav();
  const { cartLineCount } = useCartRead();

  return (
    <View style={s.root}>
      <Touchable
        onPress={() => router.push("/search")}
        style={s.actionButton}
      >
        <icons.search width={exactScale(20)} height={exactScale(20)} />
      </Touchable>
      <View style={s.cartWrap}>
        <Touchable
          onPress={() => router.push("/(commerce)/cart")}
          style={s.actionButton}
        >
          <icons.cart_outline width={exactScale(22)} height={exactScale(22)} />
        </Touchable>
        {cartLineCount > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>
              {cartLineCount}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
CategoriesHeaderActions.displayName = "CategoriesHeaderActions";
