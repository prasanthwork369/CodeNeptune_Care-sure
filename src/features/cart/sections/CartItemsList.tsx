import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { cartStyles as s } from "../cart.styles";
import { CartItemsListProps } from "@/src/features/cart/types";
import { CartItemRow } from "@/src/features/cart/components/CartItemRow";

export const CartItemsList: React.FC<CartItemsListProps> = React.memo(
  ({ lines, onUpdateItem, onRemoveItem }) => {
    const { width } = useWindowDimensions();
    const compact = width < 360;

    return (
      <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 pt-4 pb-2">
        <Text
          style={s.listTitle}
          className="font-inter-bold text-brand-text mb-3"
        >
          Cart Items
        </Text>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#E5E7EB",
            marginHorizontal: -16,
          }}
        />
        {lines.map((line, idx) => (
          <CartItemRow
            key={line.id}
            line={line}
            compact={compact}
            showDivider={idx > 0}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </View>
    );
  },
);

CartItemsList.displayName = "CartItemsList";
