import { icons } from "@/src/constants/icons";
import { OfferShine } from "@/src/components/ui/offerShine";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./tracking.styles";

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
    <View style={s.savingsWrapper}>
      <LinearGradient
        colors={["#FBFEFC", "#EBFAF0"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
      >
        <View style={s.savingsHeaderRow}>
          <View style={s.savingsHeaderTitleRow}>
            <icons.percent_discount
              width={exactScale(18)}
              height={exactScale(18)}
              fill="#0F7635"
            />
            <Text style={s.savingsHeaderTitle}>
              Saving this order
            </Text>
          </View>
          <LinearGradient
            colors={["#68D36C", "#329939"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={s.savingsPillGradient}
          >
            <View style={s.savingsPillInner}>
              <Text style={s.savingsPillText}>
                ₹{totalSaved.toFixed(2)}
              </Text>
            </View>
            <OfferShine borderRadius={exactScale(6)} />
          </LinearGradient>
        </View>
      </LinearGradient>
      <View style={s.savingsBreakdownContent}>
        {productDiscount > 0 && (
          <View style={s.discountRow}>
            <Text style={s.discountLabel}>
              Product Discount
            </Text>
            <Text style={s.discountValue}>
              -₹{productDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {couponDiscount > 0 && (
          <View style={s.discountRow}>
            <Text style={s.discountLabel}>
              Coupon Discount
            </Text>
            <Text style={s.discountValue}>
              -₹{couponDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {walletDiscount > 0 && (
          <View style={s.discountRow}>
            <Text style={s.discountLabel}>
              CareSure Wallet
            </Text>
            <Text style={s.discountValue}>
              -₹{walletDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {coinsDiscount > 0 && (
          <View style={s.discountRow}>
            <Text style={s.discountLabel}>
              CareSure Coins
            </Text>
            <Text style={s.discountValue}>
              -₹{coinsDiscount.toFixed(2)}
            </Text>
          </View>
        )}
        {hasNoDiscounts && (
          <View style={s.discountRow}>
            <Text style={s.discountLabel}>
              No discounts applied
            </Text>
            <Text style={s.discountValue}>
              ₹0.00
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
