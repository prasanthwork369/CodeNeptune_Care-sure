import React from "react";
import { View, Text } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { icons } from "@/src/constants/icons";
import { useCartRead } from "@/src/features/cart/hooks/useCartRead";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const CategoriesHeaderActions: React.FC = () => {
  const router = useNav();
  const { cartLineCount } = useCartRead();

  return (
    <View className="flex-row items-center" style={{ gap: exactScale(8) }}>
      <Touchable
        onPress={() => router.push("/search")}
        className="rounded-full bg-white border border-[#919EAB33] items-center justify-center"
        style={{ width: exactScale(44), height: exactScale(44) }}
      >
        <icons.search width={20} height={20} />
      </Touchable>
      <View className="relative">
        <Touchable
          onPress={() => router.push("/(commerce)/cart")}
          className="rounded-full bg-white border border-[#919EAB33] items-center justify-center"
          style={{ width: exactScale(44), height: exactScale(44) }}
        >
          <icons.cart_outline width={22} height={22} />
        </Touchable>
        {cartLineCount > 0 && (
          <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C22923] items-center justify-center">
            <Text
              className="font-inter-bold text-white"
              style={{ fontSize: moderateScale(10) }}
            >
              {cartLineCount}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
