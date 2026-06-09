import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Text, View } from "react-native";
import { searchCartBarStyles as s } from '../search.styles';

export const SearchCartBar = ({
  totalPrice,
  cartCount,
  bottomPad,
  onViewCart,
}: {
  totalPrice: number;
  cartCount: number;
  bottomPad: number;
  onViewCart: () => void;
}) => (
  <View
    style={{
      shadowColor: "#919EAB33",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 10,
      paddingTop: 16,
      paddingBottom: bottomPad,
    }}
    className="absolute bottom-0 left-0 right-0 bg-white px-6 flex-row items-center justify-between border-t border-[#F3F4F6]"
  >
    <View>
      <Text style={s.price} className="font-inter-bold text-[#111827]">
        ₹{Number(totalPrice).toFixed(2)}
      </Text>
      <Text style={s.items} className="font-inter-medium text-brand-subtext mt-0.5">
        {cartCount} Item(s)
      </Text>
    </View>
    <Touchable
      activeOpacity={0.8}
      onPress={onViewCart}
      className="bg-brand-primary rounded-[12px] px-10 py-3.5"
    >
      <Text style={s.btnText} className="font-inter-bold text-white">View Cart</Text>
    </Touchable>
  </View>
);
