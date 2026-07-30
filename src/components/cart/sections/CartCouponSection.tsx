import { Skeleton } from "@/src/components/ui/Skeleton";
import { OfferShine } from "@/src/components/ui/offerShine";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useCoupons } from "@/src/hooks/queries/useCoupons";
import { useCouponAvailability } from "@/src/hooks/useCouponAvailability";
import { useNav } from "@/src/hooks/useNav";
import { couponService } from "@/src/services/coupon.service";
import { useCouponStore } from "@/src/store/couponStore";
import { CartCouponSectionProps } from "@/src/types/cart";
import {
  computeCouponDiscount,
  selectCartCoupon,
} from "@/src/utils/couponSelection";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";
import { cartStyles as s } from "../cart.styles";

export const CartCouponSection: React.FC<CartCouponSectionProps> = ({
  appliedCoupon,
  onRemove,
  subtotal,
}) => {
  const router = useNav();
  const { data: coupons = [], isLoading } = useCoupons();
  const apply = useCouponStore((s) => s.apply);
  const [applying, setApplying] = useState(false);
  const [validatedOnce, setValidatedOnce] = useState(false);

  // Same pre-validation the coupons screen uses, so a limit-reached coupon is never recommended.
  const { unavailable, checking } = useCouponAvailability(coupons, subtotal);

  useEffect(() => {
    if (!checking) setValidatedOnce(true);
  }, [checking]);

  // Recomputed as the subtotal moves, so the card tracks what this cart can actually use.
  const pick = useMemo(
    () => selectCartCoupon(coupons, subtotal, unavailable),
    [coupons, subtotal, unavailable],
  );

  const handleDirectApply = async () => {
    if (!pick) return;
    setApplying(true);
    try {
      const result = await couponService.validateCoupon(
        pick.coupon.code,
        subtotal,
      );
      if (result.valid) {
        apply({
          code: pick.coupon.code,
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
      ? computeCouponDiscount(appliedCouponDef, subtotal)
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
            <View className="bg-[#E8F5E9] px-2 py-1 rounded flex-shrink-0 relative overflow-hidden">
              <Text
                style={s.couponText}
                className="font-inter-bold text-brand-primary"
                numberOfLines={1}
              >
                {appliedCoupon.code}
              </Text>
              <OfferShine borderRadius={exactScale(4)} />
            </View>
            <Text
              style={s.couponText}
              className="font-inter-medium text-brand-primary flex-shrink"
              numberOfLines={1}
            >
              - ₹{displayedDiscount.toFixed(2)} saved
            </Text>
          </View>
          <Touchable
            onPress={onRemove}
            style={{ flexShrink: 0 }}
            accessibilityRole="button"
            accessibilityLabel={`Remove coupon ${appliedCoupon.code}`}
          >
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

  // While coupons are loading (no cached data yet), reserve the space with a
  // skeleton instead of the small "Apply Coupon" fallback. Otherwise the small
  // row shows first and then jumps to the big "Coupons & offers" card once the
  // query resolves — the flicker/jerk on first load.
  // Only the first validation blocks the card; later re-checks keep the last good pick so
  // editing quantities never flashes the skeleton back in.
  if (isLoading || (checking && !validatedOnce)) {
    return (
      <View className="mx-4 mt-3">
        <Skeleton width="100%" height={exactScale(132)} borderRadius={16} />
      </View>
    );
  }

  if (!pick) {
    return (
      <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 py-3">
        <Touchable
          onPress={() => router.push("/(stack)/coupons")}
          className="flex-row items-center justify-between"
          accessibilityRole="button"
          accessibilityLabel="View available coupons"
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

  const { coupon: bestCoupon, savings, isLocked, remaining } = pick;

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
            accessibilityRole="button"
            accessibilityLabel={`Apply coupon ${bestCoupon.code}`}
            accessibilityState={{ disabled: isLocked || applying, busy: applying }}
            style={{
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: isLocked ? "#E4E7EC" : "#919EAB33",
              borderRadius: 6,
              width: exactScale(72),
              height: exactScale(42),
              padding: exactScale(8),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#222222" />
            ) : (
              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontWeight: "700",
                  color: isLocked ? "#9CA3AF" : "#222222",
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
        accessibilityRole="button"
        accessibilityLabel="View all coupons"
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
