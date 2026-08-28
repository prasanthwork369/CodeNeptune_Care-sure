import { Touchable } from "@/src/components/ui/Touchable";
import { COUPON_DISCOUNT_TYPE } from "../constants/coupon";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import type { CouponCardProps } from "@/src/features/cart/types";
import {
  formatCouponExpiry,
  formatCouponTerms,
} from "../utils/couponFormat";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { styles as s } from "./CouponCard.styles";

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onApply,
  disabled = false,
  isApplied = false,
  isUnavailable = false,
  loading = false,
}) => {
  const inactive = isApplied || isUnavailable;
  const isPercentage = coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE;
  const discountLabel = isPercentage
    ? `Save ${coupon.discountValue}%`
    : `Save ${coupon.discountValue}`;
  const description = formatCouponTerms(coupon);
  const expiry = formatCouponExpiry(coupon.expiresAt);
  const isButtonDisabled = disabled || inactive || loading;

  return (
    <View
      style={[
        s.cardContainer,
        inactive ? s.cardInactive : s.cardActive,
      ]}
    >
      <Touchable
        activeOpacity={0.85}
        disabled={isButtonDisabled}
        onPress={() => onApply(coupon.code)}
        style={s.cardTouchable}
      >
        <View style={s.cardTop}>
          <View style={s.iconWrapper}>
            <icons.percent_discount
              width={exactScale(22)}
              height={exactScale(22)}
              fill={colors.primary}
            />
          </View>
          <View style={s.infoCol}>
            <Text style={s.discountText}>{discountLabel}</Text>
            <Text style={s.descText}>{description}</Text>
            {expiry ? (
              <Text style={s.expiryText}>Expires {expiry}</Text>
            ) : null}
          </View>
          <View style={s.fadedIconContainer}>
            <icons.percent_discount
              width={exactScale(60)}
              height={exactScale(60)}
              fill="#0F7635"
              opacity={0.09}
            />
          </View>
        </View>

        <View style={s.dashedDivider} />

        <View style={s.cardBottom}>
          <Text numberOfLines={1} style={s.couponCodeText}>
            {coupon.code}
          </Text>
          <Touchable
            disabled={isButtonDisabled}
            onPress={() => onApply(coupon.code)}
            style={[
              s.applyBtn,
              disabled || inactive ? s.applyBtnInactive : s.applyBtnActive,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={disabled || inactive ? colors.primary : "#FFFFFF"}
              />
            ) : (
              <Text
                numberOfLines={1}
                style={[
                  s.applyBtnText,
                  disabled || inactive
                    ? s.applyBtnTextInactive
                    : s.applyBtnTextActive,
                ]}
              >
                {isApplied ? "APPLIED" : isUnavailable ? "USED" : "APPLY"}
              </Text>
            )}
          </Touchable>
        </View>
      </Touchable>

      {/* Left Notch Cutout */}
      <View style={s.leftNotchWrapper}>
        <View style={s.leftNotchCircle} />
      </View>

      {/* Right Notch Cutout */}
      <View style={s.rightNotchWrapper}>
        <View style={s.rightNotchCircle} />
      </View>
    </View>
  );
};
