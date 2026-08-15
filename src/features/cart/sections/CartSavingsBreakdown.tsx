import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import PercentDiscountIcon from "@/assets/icons/percent_discount.svg";
import { colors } from "@/src/constants/theme";
import { CartSavingsBreakdownProps } from "@/src/features/cart/types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const CartSavingsBreakdown: React.FC<CartSavingsBreakdownProps> = ({
  totalSavings,
  rows,
}) => {
  return (
    <View
      style={{
        marginHorizontal: exactScale(16),
        marginTop: exactScale(12),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#919EAB33",
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={["#FBFEFC", "#EBFAF0"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
      >
        <View className="px-4 py-3 flex-row items-center">
          <PercentDiscountIcon width={20} height={20} fill={colors.primary} />
          <Text
            className="flex-1 font-inter-bold text-brand-text ml-2"
            style={{ fontSize: moderateScale(14) }}
          >
            Saving this order
          </Text>
          <LinearGradient
            colors={["#68D36C", "#329939"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ borderRadius: 6 }}
          >
            <View className="px-2.5 py-1">
              <Text
                className="font-inter-bold text-white"
                style={{ fontSize: moderateScale(12) }}
              >
                ₹{parseFloat(totalSavings.toFixed(2))}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>
      <View style={{ height: 1, backgroundColor: "#919EAB33" }} />
      <View className="px-4 py-2">
        {rows.map((row) => (
          <View
            key={row.label}
            className="flex-row items-center justify-between py-2"
          >
            <Text
              className={`font-inter-medium ${row.value > 0 ? "text-[#6A6A6A]" : "text-[#C0C0C0]"}`}
              style={{ fontSize: moderateScale(13) }}
            >
              {row.label}
            </Text>
            <Text
              className={`font-inter-semibold ${row.value > 0 ? "text-[#0F7635]" : "text-[#C0C0C0]"}`}
              style={{ fontSize: moderateScale(13) }}
            >
              {row.value > 0 ? `- ₹${parseFloat(row.value.toFixed(2))}` : "—"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
