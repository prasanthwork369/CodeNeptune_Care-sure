import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useCoupons } from "@/src/hooks/queries/useCoupons";
import { useNav } from "@/src/hooks/useNav";
import {
    CartCouponSectionProps,
    Coupon,
    COUPON_DISCOUNT_TYPE,
} from "@/src/types/cart";
import React from "react";
import { Image, Text, View } from "react-native";
import { cartStyles as s } from "../cart.styles";

const computeDiscount = (coupon: Coupon, amount: number) => {
  if (coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE) {
    const raw = (amount * coupon.discountValue) / 100;
    return coupon.maxDiscountAmount
      ? Math.min(raw, coupon.maxDiscountAmount)
      : raw;
  }
  return coupon.discountValue;
};

export const CartCouponSection: React.FC<CartCouponSectionProps> = ({
  appliedCoupon,
  onRemove,
  subtotal,
}) => {
  const router = useNav();
  const { data: coupons = [] } = useCoupons();

  const bestCoupon = coupons.length
    ? coupons.reduce((best, c) => {
        const cSavings = computeDiscount(
          c,
          Math.max(subtotal, c.minOrderValue),
        );
        const bestSavings = computeDiscount(
          best,
          Math.max(subtotal, best.minOrderValue),
        );
        return cSavings > bestSavings ? c : best;
      })
    : null;

  if (appliedCoupon) {
    return (
      <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-2">
            <Image
              source={HOME_IMAGES.couponIcon}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
            <View className="bg-[#E8F5E9] px-2 py-1 rounded">
              <Text
                style={s.couponText}
                className="font-inter-bold text-brand-primary"
              >
                {appliedCoupon.code}
              </Text>
            </View>
            <Text
              style={s.couponText}
              className="font-inter-medium text-brand-primary"
            >
              - ₹{Number(appliedCoupon.discount).toFixed(2)} saved
            </Text>
          </View>
          <Touchable onPress={onRemove}>
            <Text
              style={s.couponText}
              className="font-inter-semibold text-[#E16D09]"
            >
              Remove
            </Text>
          </Touchable>
        </View>
      </View>
    );
  }

  if (!bestCoupon) {
    return (
      <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 py-3">
        <Touchable
          onPress={() => router.push("/(modal)/coupons")}
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-x-3">
            <Image
              source={HOME_IMAGES.couponIcon}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
            <Text
              style={s.couponTitle}
              className="font-inter-semibold text-brand-text"
            >
              Apply Coupon
            </Text>
          </View>
          <icons.arrow_forward_ios width={14} height={14} fill={colors.text} />
        </Touchable>
      </View>
    );
  }

  const isLocked = subtotal < bestCoupon.minOrderValue;
  const savings = computeDiscount(
    bestCoupon,
    Math.max(subtotal, bestCoupon.minOrderValue),
  );
  const remaining = bestCoupon.minOrderValue - subtotal;

  return (
    <View className="mx-4 mt-3 rounded-[12px] border border-[#BFE3FF] overflow-hidden">
      <View className="bg-[#EAF6FF] px-4 pt-3 pb-3">
        <Text className="text-[14px] font-inter-bold text-[#1A1C1E] mb-2">
          Coupons & offers
        </Text>

        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-md bg-[#E1F2FF] items-center justify-center mr-3 border border-[#BFE3FF]">
            <Image
              source={HOME_IMAGES.couponIcon}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-inter-bold text-[#1A1C1E]">
              Save ₹{savings.toFixed(0)} with {bestCoupon.code}
            </Text>
            {isLocked && (
              <Text className="text-[12px] font-inter-semibold text-[#E16D09] mt-0.5">
                Shop ₹{remaining.toFixed(0)} more to apply
              </Text>
            )}
          </View>
          {isLocked && (
            <View className="bg-white border border-[#919EAB33] px-3.5 py-1.5 rounded-sm  shadow-sm">
              <Text className="text-[12px] font-inter-semibold text-[#6A6A6A]">
                Locked
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={{
          height: 1,
          borderBottomWidth: 1,
          borderBottomColor: "#E3EFFD",
          borderStyle: "dashed",
          width: "100%",
        }}
      />

      <Touchable
        onPress={() => router.push("/(modal)/coupons")}
        activeOpacity={0.8}
        className="bg-white flex-row items-center justify-between px-4 py-3"
      >
        <Text className="text-[13px] font-inter-medium text-[#6A6A6A]">
          View all coupon
        </Text>
        <icons.arrow_forward_ios width={14} height={14} fill={colors.text} />
      </Touchable>
    </View>
  );
};
