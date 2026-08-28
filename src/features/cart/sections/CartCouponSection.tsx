import { OfferShine } from "@/src/components/ui/offerShine";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import {
  useCouponAvailability,
  useCoupons,
} from "@/src/features/cart/hooks/useCoupons";
import type { CartCouponSectionProps, Coupon } from "@/src/features/cart/types";
import { useNav } from "@/src/hooks/useNav";
import { useCheckoutDraftStore } from "@/src/store/checkoutDraftStore";
import { useCouponStore } from "@/src/store/couponStore";
import { exactScale } from "@/src/utils/exactScale";
import { requireInternet } from "@/src/utils/offline";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";
import { couponApi } from "../api/coupon.api";
import {
  computeCouponDiscount,
  selectCartCoupon,
  selectNextCouponUpsell,
} from "../utils/couponSelection";
import { styles as s } from "./CartCouponSection.styles";

const EMPTY_COUPONS: Coupon[] = [];

export const CartCouponSection: React.FC<CartCouponSectionProps> = ({
  appliedCoupon,
  onRemove,
  subtotal,
}) => {
  const router = useNav();
  const { data: rawCoupons, isLoading } = useCoupons();
  const coupons = rawCoupons ?? EMPTY_COUPONS;
  const apply = useCouponStore((st) => st.apply);
  const [applying, setApplying] = useState(false);

  const unavailable = useCouponAvailability(coupons);

  useEffect(() => {
    const draftCode = useCheckoutDraftStore.getState().couponCode;
    if (appliedCoupon || !draftCode || subtotal <= 0) return;
    couponApi
      .validateCoupon(draftCode, subtotal)
      .then((result) => {
        if (useCouponStore.getState().applied) return;
        if (result.valid) {
          apply({
            code: draftCode,
            discount: Number(result.discount) || 0,
            description: result.message ?? "",
          });
        } else {
          useCheckoutDraftStore.getState().setCouponCode("");
        }
      })
      .catch(() => {});
  }, [subtotal, appliedCoupon, apply]);

  const pick = useMemo(
    () => selectCartCoupon(coupons, subtotal, unavailable),
    [coupons, subtotal, unavailable],
  );

  const upsell = useMemo(
    () => selectNextCouponUpsell(coupons, subtotal, pick, unavailable),
    [coupons, subtotal, pick, unavailable],
  );

  const handleDirectApply = async () => {
    if (!pick) return;
    if (!requireInternet()) return;
    setApplying(true);
    try {
      const result = await couponApi.validateCoupon(
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
      <View style={s.appliedContainer}>
        <View style={s.appliedRow}>
          <View style={s.appliedLeft}>
            <Image
              source={HOME_IMAGES.couponIcon}
              style={s.couponIconSmall}
              resizeMode="contain"
            />
            <View style={s.codeBadge}>
              <Text style={s.codeBadgeText} numberOfLines={1}>
                {appliedCoupon.code}
              </Text>
              <OfferShine borderRadius={exactScale(4)} />
            </View>
            <Text style={s.savedText} numberOfLines={1}>
              - ₹{displayedDiscount.toFixed(2)} saved
            </Text>
          </View>
          <Touchable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`Remove coupon ${appliedCoupon.code}`}
          >
            <Text style={s.removeBtnText}>Remove</Text>
          </Touchable>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={s.skeletonWrap}>
        <Skeleton width="100%" height={exactScale(132)} borderRadius={16} />
      </View>
    );
  }

  if (!pick) {
    return (
      <View style={s.simpleCard}>
        <Touchable
          onPress={() => router.push("/(commerce)/coupons")}
          style={s.simpleCardTouchable}
          accessibilityRole="button"
          accessibilityLabel="View available coupons"
        >
          <View style={s.simpleCardLeft}>
            <Image
              source={HOME_IMAGES.couponIcon}
              style={s.couponIconSmall}
              resizeMode="contain"
            />
            <Text style={s.simpleCardTitle}>Apply Coupon</Text>
          </View>
          <icons.arrow_forward_ios width={14} height={14} fill={colors.text} />
        </Touchable>
      </View>
    );
  }

  const { coupon: bestCoupon, savings, isLocked, remaining } = pick;

  return (
    <View style={s.fullCard}>
      <View style={s.fullCardTop}>
        <Text style={s.fullCardHeading}>Coupons & offers</Text>

        <View style={s.fullCardRow}>
          <View style={s.fullCardIconBox}>
            <Image
              source={HOME_IMAGES.couponIcon}
              style={s.fullCardIcon}
              resizeMode="contain"
            />
          </View>
          <View style={s.fullCardBody}>
            <Text numberOfLines={2} style={s.fullCardTitle}>
              Save ₹{savings.toFixed(0)} with {bestCoupon.code}
            </Text>
            {isLocked ? (
              <Text style={s.fullCardUpsellText}>
                Shop ₹{remaining.toFixed(0)} more to apply
              </Text>
            ) : upsell ? (
              <Text style={s.fullCardUpsellText}>
                Shop ₹{upsell.gap.toFixed(0)} more to get ₹
                {upsell.savings.toFixed(0)} off
              </Text>
            ) : null}
          </View>
          <Touchable
            disabled={isLocked || applying}
            onPress={handleDirectApply}
            accessibilityRole="button"
            accessibilityLabel={`Apply coupon ${bestCoupon.code}`}
            accessibilityState={{
              disabled: isLocked || applying,
              busy: applying,
            }}
            style={[
              s.applyActionBtn,
              {
                borderColor: isLocked ? "#E4E7EC" : "#919EAB33",
              },
            ]}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#222222" />
            ) : (
              <Text
                style={[
                  s.applyActionBtnText,
                  { color: isLocked ? "#9CA3AF" : "#222222" },
                ]}
              >
                Apply
              </Text>
            )}
          </Touchable>
        </View>
      </View>

      <View style={s.cardDashedDivider} />

      <Touchable
        onPress={() => router.push("/(commerce)/coupons")}
        activeOpacity={0.8}
        style={s.viewAllRow}
        accessibilityRole="button"
        accessibilityLabel="View all coupons"
      >
        <Text style={s.viewAllText}>View all coupon</Text>
        <icons.arrow_forward_ios width={12} height={12} fill="#6A6A6A" />
      </Touchable>
    </View>
  );
};
