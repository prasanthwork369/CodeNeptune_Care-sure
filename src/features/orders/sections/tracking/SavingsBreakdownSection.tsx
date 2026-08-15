import { icons } from "@/src/constants/icons";
import { OfferShine } from "@/src/components/ui/offerShine";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { orderStyles as s } from "../../orders.styles";

interface SavingsBreakdownSectionProps {
  totalSaved: number;
  productDiscount: number;
  couponDiscount: number;
  walletDiscount: number;
  coinsDiscount: number;
}

export function SavingsBreakdownSection({
  totalSaved,
  productDiscount,
  couponDiscount,
  walletDiscount,
  coinsDiscount,
}: SavingsBreakdownSectionProps) {
  const hasNoDiscounts =
    productDiscount === 0 &&
    couponDiscount === 0 &&
    walletDiscount === 0 &&
    coinsDiscount === 0;

  return (
    <View className="mx-base rounded-lg overflow-hidden border border-[#919EAB33] bg-white">
      <LinearGradient
        colors={["#FBFEFC", "#EBFAF0"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
      >
        <View
          className="flex-row items-center justify-between"
          style={{
            paddingHorizontal: exactScale(16),
            paddingVertical: exactScale(12),
          }}
        >
          <View
            className="flex-row items-center"
            style={{ gap: exactScale(8) }}
          >
            <icons.percent_discount
              width={exactScale(18)}
              height={exactScale(18)}
              fill="#0F7635"
            />
            <Text style={s.labelMd} className="font-inter-bold text-brand-text">
              Saving this order
            </Text>
          </View>
          <LinearGradient
            colors={["#68D36C", "#329939"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ borderRadius: exactScale(6), overflow: "hidden" }}
          >
            <View
              style={{
                paddingHorizontal: exactScale(10),
                paddingVertical: exactScale(4),
              }}
            >
              <Text style={s.labelSm} className="font-inter-bold text-white">
                ₹{totalSaved.toFixed(2)}
              </Text>
            </View>
            <OfferShine borderRadius={exactScale(6)} />
          </LinearGradient>
        </View>
      </LinearGradient>
      <View
        style={{
          paddingHorizontal: exactScale(16),
          paddingVertical: exactScale(8),
        }}
      >
        {productDiscount > 0 && (
          <View
            className="flex-row justify-between items-center"
            style={{ paddingVertical: exactScale(8) }}
          >
            <Text
              style={s.labelSm}
              className="font-inter-medium text-[#6A6A6A]"
            >
              Product Discount
            </Text>
            <Text
              style={s.labelSm}
              className="font-inter-semibold text-[#0F7635]"
            >
              -₹{productDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {couponDiscount > 0 && (
          <View
            className="flex-row justify-between items-center"
            style={{ paddingVertical: exactScale(8) }}
          >
            <Text
              style={s.labelSm}
              className="font-inter-medium text-[#6A6A6A]"
            >
              Coupon Discount
            </Text>
            <Text
              style={s.labelSm}
              className="font-inter-semibold text-[#0F7635]"
            >
              -₹{couponDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {walletDiscount > 0 && (
          <View
            className="flex-row justify-between items-center"
            style={{ paddingVertical: exactScale(8) }}
          >
            <Text
              style={s.labelSm}
              className="font-inter-medium text-[#6A6A6A]"
            >
              CareSure Wallet
            </Text>
            <Text
              style={s.labelSm}
              className="font-inter-semibold text-[#0F7635]"
            >
              -₹{walletDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {coinsDiscount > 0 && (
          <View
            className="flex-row justify-between items-center"
            style={{ paddingVertical: exactScale(8) }}
          >
            <Text
              style={s.labelSm}
              className="font-inter-medium text-[#6A6A6A]"
            >
              CareSure Coins
            </Text>
            <Text
              style={s.labelSm}
              className="font-inter-semibold text-[#0F7635]"
            >
              -₹{coinsDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {hasNoDiscounts && (
          <View
            className="flex-row justify-between items-center"
            style={{ paddingVertical: exactScale(8) }}
          >
            <Text
              style={s.labelSm}
              className="font-inter-medium text-[#6A6A6A]"
            >
              No discounts applied
            </Text>
            <Text
              style={s.labelSm}
              className="font-inter-semibold text-[#0F7635]"
            >
              ₹0.00
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
