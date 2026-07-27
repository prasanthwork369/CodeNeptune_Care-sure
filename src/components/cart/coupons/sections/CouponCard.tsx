import { Touchable } from "@/src/components/ui/Touchable";
import { COUPON_DISCOUNT_TYPE } from "@/src/constants/coupon";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { CouponCardProps } from "@/src/types/cart";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onApply,
  disabled = false,
  isApplied = false,
  isUnavailable = false,
}) => {
  // Both applied and limit-reached coupons read as inactive (faded).
  const inactive = isApplied || isUnavailable;
  const isPercentage = coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE;
  const discountLabel = isPercentage
    ? `Save ${coupon.discountValue}%`
    : `Save ${coupon.discountValue}`;
  const description = isPercentage
    ? `${coupon.discountValue}% off on orders above ₹${coupon.minOrderValue}${coupon.maxDiscountAmount ? `, max ₹${coupon.maxDiscountAmount}` : ""}`
    : `Flat ₹${coupon.discountValue} off on orders above ₹${coupon.minOrderValue}`;

  return (
    <View
      style={{
        marginBottom: exactScale(12),
        position: "relative",
        opacity: inactive ? 0.5 : 1,
      }}
    >
      <Touchable
        activeOpacity={0.85}
        onPress={() => onApply(coupon.code)}
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: exactScale(13),
          borderWidth: 1,
          borderColor: "#919EAB33",
        }}
      >
        <View
          style={{
            minHeight: exactScale(67),
            paddingHorizontal: exactScale(16),
            paddingVertical: exactScale(12),
            flexDirection: "row",
            alignItems: "center",
            overflow: "hidden",
            borderTopLeftRadius: exactScale(13),
            borderTopRightRadius: exactScale(13),
          }}
        >
          <View style={styles.iconWrapper}>
            <icons.percent_discount
              width={exactScale(22)}
              height={exactScale(22)}
              fill={colors.primary}
            />
          </View>
          <View style={{ marginLeft: exactScale(12), flex: 1 }}>
            <Text
              style={{
                fontSize: moderateScale(17),
                lineHeight: moderateScale(22),
                fontWeight: "700",
                color: "#000000",
              }}
            >
              {discountLabel}
            </Text>
            <Text
              style={{
                color: "#E53827",
                fontSize: moderateScale(13),
                lineHeight: moderateScale(17),
                fontWeight: "500",
                marginTop: exactScale(2),
              }}
            >
              {description}
            </Text>
            <Text
              style={{
                fontSize: moderateScale(11),
                lineHeight: moderateScale(15),
                fontWeight: "500",
                color: "#6A6A6A",
                marginTop: exactScale(3),
              }}
            >
              Expires {formatExpiry(coupon.expiresAt)}
            </Text>
          </View>
          <View style={styles.fadedIconContainer}>
            <icons.percent_discount
              width={exactScale(60)}
              height={exactScale(60)}
              fill="#0F7635"
              opacity={0.09}
            />
          </View>
        </View>
        <View style={styles.dashedDivider} />
        <View
          style={{
            height: exactScale(46),
            paddingHorizontal: exactScale(16),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffffff",
            borderBottomLeftRadius: exactScale(13),
            borderBottomRightRadius: exactScale(13),
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(14),
              fontWeight: "700",
              color: "#000000",
              letterSpacing: 0.5,
            }}
          >
            {coupon.code}
          </Text>
          <Touchable
            // Keep applied coupons pressable so the "already applied" toast still fires;
            // only the min-order case is truly disabled.
            disabled={disabled}
            onPress={() => onApply(coupon.code)}
            style={{
              backgroundColor: disabled || inactive ? "#FFFFFF" : colors.primary,
              borderWidth: disabled || inactive ? 1 : 0,
              borderColor: disabled || inactive ? "#E4E7EC" : "transparent",
              width: exactScale(55),
              height: exactScale(28),
              borderRadius: exactScale(4),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: disabled || inactive ? "#9CA3AF" : "#FFFFFF",
                fontSize: moderateScale(13),
                lineHeight: moderateScale(17),
                fontWeight: "700",
              }}
            >
              {isApplied ? "APPLIED" : "APPLY"}
            </Text>
          </Touchable>
        </View>
      </Touchable>
      {/* Left Notch Cutout (Clipped to show only inner semi-circle) */}
      <View style={styles.leftNotchWrapper}>
        <View style={styles.leftNotchCircle} />
      </View>

      {/* Right Notch Cutout (Clipped to show only inner semi-circle) */}
      <View style={styles.rightNotchWrapper}>
        <View style={styles.rightNotchCircle} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    width: exactScale(40),
    height: exactScale(40),
    borderRadius: exactScale(6),
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
  },
  fadedIconContainer: {
    position: "absolute",
    right: exactScale(-15),
    top: exactScale(-10),
    zIndex: -1,
  },
  dashedDivider: {
    height: 1,
    marginHorizontal: exactScale(10),
    borderWidth: 1,
    borderColor: "#919EAB33",
    borderStyle: "dashed",
    borderRadius: 1,
  },
  leftNotchWrapper: {
    position: "absolute",
    left: 0,
    bottom: exactScale(36),
    width: exactScale(10),
    height: exactScale(20),
    overflow: "hidden",
    zIndex: 10,
  },
  leftNotchCircle: {
    width: exactScale(20),
    height: exactScale(20),
    borderRadius: exactScale(10),
    backgroundColor: "#F5F6FB",
    borderWidth: 1,
    borderColor: "#919EAB33",
    position: "absolute",
    left: exactScale(-10),
    top: 0,
  },
  rightNotchWrapper: {
    position: "absolute",
    right: 0,
    bottom: exactScale(36),
    width: exactScale(10),
    height: exactScale(20),
    overflow: "hidden",
    zIndex: 10,
  },
  rightNotchCircle: {
    width: exactScale(20),
    height: exactScale(20),
    borderRadius: exactScale(10),
    backgroundColor: "#F5F6FB",
    borderWidth: 1,
    borderColor: "#919EAB33",
    position: "absolute",
    right: exactScale(-10),
    top: 0,
  },
});
