import React from "react";
import { View, Text } from "react-native";
import { cartStyles as s } from "../cart.styles";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { CartCoinsSectionProps } from "@/src/types/cart";

export const CartCoinsSection: React.FC<CartCoinsSectionProps> = ({
  value,
  availableCoins,
  redeemedCoins,
  onToggle,
  onInfoPress,
}) => {
  return (
    <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 py-3.5 flex-row items-center">
      <Touchable
        className="flex-1"
        activeOpacity={0.7}
        onPress={onInfoPress}
        accessibilityRole="button"
        accessibilityLabel="Learn about CareSure Coins"
      >
        <View className="flex-row items-center gap-x-1.5">
          <Text
            style={s.coinsTitle}
            className="font-inter-bold text-brand-text"
          >
            {value
              ? `${redeemedCoins} CareSure Coins Redeemed`
              : "CareSure Coins"}
          </Text>
          <icons.info_outline width={17} height={17} />
        </View>
        <Text
          style={s.coinsSub}
          className="font-inter-medium text-brand-subtext mt-0.5"
        >
          {value
            ? `${Math.max(0, availableCoins - redeemedCoins)} coins remaining`
            : `${availableCoins} coins available`}
        </Text>
      </Touchable>
      <Touchable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityLabel="Use CareSure Coins"
        accessibilityState={{ checked: value }}
        style={[
          s.coinsCheck,
          {
            borderRadius: 4,
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: value ? "#0F7635" : "white",
            borderColor: value ? "#0F7635" : "#9CA3AF",
          },
        ]}
      >
        {!!value && (
          <Text
            style={s.coinsCheckTxt}
            className="font-inter-bold text-white leading-none"
          >
            ✓
          </Text>
        )}
      </Touchable>
    </View>
  );
};
