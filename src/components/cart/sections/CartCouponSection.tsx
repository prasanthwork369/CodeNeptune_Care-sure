import { Touchable } from "@/src/components/ui/Touchable";
import { COUPON_DISCOUNT_TYPE } from "@/src/constants/coupon";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useCoupons } from "@/src/hooks/queries/useCoupons";
import { useNav } from "@/src/hooks/useNav";
import { couponService } from "@/src/services/coupon.service";
import { useCouponStore } from "@/src/store/couponStore";
import { CartCouponSectionProps, Coupon } from "@/src/types/cart";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";
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
  const apply = useCouponStore((s) => s.apply);
  const [applying, setApplying] = useState(false);

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

  const handleDirectApply = async () => {
    if (!bestCoupon) return;
    setApplying(true);
    try {
      const result = await couponService.validateCoupon(
        bestCoupon.code,
        subtotal,
      );
      if (result.valid) {
        apply({
          code: bestCoupon.code,
          discount: Number(result.discount) || 0,
          description: result.message ?? "",
        });
      } else {
        Alert.alert(
          "Coupon Invalid",
          result.message ?? "This coupon is not valid or has expired.",
        );
      }
    } catch {
      Alert.alert("Error", "Could not validate coupon. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (appliedCoupon) {
    const appliedCouponDef = coupons.find((c) => c.code === appliedCoupon.code);
    const displayedDiscount = appliedCouponDef
      ? computeDiscount(appliedCouponDef, subtotal)
      : Number(appliedCoupon.discount) || 0;
    return (
      <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-2 flex-1 mr-2">
            <Image
              source={HOME_IMAGES.couponIcon}
              style={{ width: exactScale(22), height: exactScale(22) }}
              resizeMode="contain"
            />
            <View className="bg-[#E8F5E9] px-2 py-1 rounded flex-shrink-0">
              <Text
                style={s.couponText}
                className="font-inter-bold text-brand-primary"
                numberOfLines={1}
              >
                {appliedCoupon.code}
              </Text>
            </View>
            <Text
              style={s.couponText}
              className="font-inter-medium text-brand-primary flex-shrink"
              numberOfLines={1}
            >
              - ₹{displayedDiscount.toFixed(2)} saved
            </Text>
          </View>
          <Touchable onPress={onRemove} style={{ flexShrink: 0 }}>
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
          onPress={() => router.push("/(stack)/coupons")}
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-x-3">
            <Image
              source={HOME_IMAGES.couponIcon}
              style={{ width: exactScale(22), height: exactScale(22) }}
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
    <View className="mx-4 mt-3 rounded-[16px] border border-[#BFE3FF] overflow-hidden bg-white">
      <View className="bg-[#EAF6FF] px-4 pt-4 pb-4">
        <Text
          style={{
            fontSize: moderateScale(15),
            fontWeight: "700",
            color: "#1A1C1E",
            marginBottom: exactScale(10),
          }}
        >
          Coupons & offers
        </Text>

        <View className="flex-row items-center">
          <View
            style={{
              width: exactScale(44),
              height: exactScale(44),
              borderRadius: 10,
              backgroundColor: "#E1F2FF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: exactScale(12),
              borderWidth: 1,
              borderColor: "#BFE3FF",
            }}
          >
            <Image
              source={HOME_IMAGES.couponIcon}
              style={{ width: exactScale(24), height: exactScale(24) }}
              resizeMode="contain"
            />
          </View>
          <View className="flex-1 mr-2">
            <Text
              numberOfLines={2}
              style={{
                fontSize: moderateScale(14),
                fontWeight: "700",
                color: "#1A1C1E",
                lineHeight: moderateScale(18),
              }}
            >
              Save ₹{savings.toFixed(0)} with {bestCoupon.code}
            </Text>
            {isLocked && (
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontWeight: "600",
                  color: "#E16D09",
                  marginTop: exactScale(3),
                }}
              >
                Shop ₹{remaining.toFixed(0)} more to apply
              </Text>
            )}
          </View>
          <Touchable
            disabled={isLocked || applying}
            onPress={handleDirectApply}
            style={{
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: isLocked ? "#E4E7EC" : "#0F7635",
              borderRadius: 6,
              width: exactScale(72),
              height: exactScale(42),
              padding: exactScale(8),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontWeight: "700",
                  color: isLocked ? "#9CA3AF" : "#0F7635",
                }}
              >
                Apply
              </Text>
            )}
          </Touchable>
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
        onPress={() => router.push("/(stack)/coupons")}
        activeOpacity={0.8}
        className="bg-white flex-row items-center justify-between px-4 py-3.5"
      >
        <Text
          style={{
            fontSize: moderateScale(14),
            fontWeight: "500",
            color: "#6A6A6A",
          }}
        >
          View all coupon
        </Text>
        <icons.arrow_forward_ios width={12} height={12} fill="#6A6A6A" />
      </Touchable>
    </View>
  );
};
