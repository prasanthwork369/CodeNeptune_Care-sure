import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { COUPON_DISCOUNT_TYPE } from "@/src/constants/coupon";
import { CouponCardProps } from "@/src/types/cart";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onApply, disabled = false }) => {
  const isPercentage = coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE;
  const discountLabel = isPercentage ? `Save ${coupon.discountValue}%` : `Save ${coupon.discountValue}`;
  const description = isPercentage
    ? `${coupon.discountValue}% off on orders above ₹${coupon.minOrderValue}${coupon.maxDiscountAmount ? `, max ₹${coupon.maxDiscountAmount}` : ''}`
    : `Flat ₹${coupon.discountValue} off on orders above ₹${coupon.minOrderValue}`;

  return (
    <View className="mb-4 relative">
      <View className="bg-white rounded-[16px] border border-[#919EAB33]">
        <View className="p-4 flex-row items-center overflow-hidden rounded-t-[16px]">
          <View style={styles.iconWrapper}>
            <icons.percent_discount width={moderateScale(22)} height={moderateScale(22)} fill={colors.primary} />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-[17px] font-inter-bold text-[#000000]">{discountLabel}</Text>
            <Text style={{ color: "#E53827" }} className="text-[12px] font-inter-semibold mt-1">{description}</Text>
            <Text className="text-[11px] font-inter-medium text-[#6A6A6A] mt-1.5">
              Expires {formatExpiry(coupon.expiresAt)}
            </Text>
          </View>
          <View style={styles.fadedIconContainer}>
            <icons.percent_discount width={60} height={60} fill="#0F7635" opacity={0.09} />
          </View>
        </View>
        <View style={styles.dashedDivider} />
        <View style={{ height: 56 }} className="px-4 flex-row items-center justify-between bg-white rounded-b-[16px]">
          <Text className="text-[14px] font-inter-bold text-[#000000] tracking-wider">{coupon.code}</Text>
          <Touchable
            disabled={disabled}
            onPress={() => onApply(coupon.code)}
            style={{ 
              backgroundColor: disabled ? "#FFFFFF" : colors.primary,
              borderWidth: disabled ? 1 : 0,
              borderColor: disabled ? "#E4E7EC" : "transparent"
            }}
            className="px-3 py-2 rounded-sm"
          >
            <Text 
              style={{ color: disabled ? "#9CA3AF" : "#FFFFFF" }} 
              className="text-[13px] font-inter-bold"
            >
              APPLY
            </Text>
          </Touchable>
        </View>
      </View>
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
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#919EAB33",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
  },
  fadedIconContainer: { position: "absolute", right: -15, top: -10, zIndex: -1 },
  dashedDivider: { height: 1, marginHorizontal: 10, borderWidth: 1, borderColor: "#919EAB33", borderStyle: "dashed", borderRadius: 1 },
  leftNotchWrapper: {
    position: "absolute",
    left: 0,
    bottom: 46, // Center exactly at the 56px divider line (56 - 20/2)
    width: 10,
    height: 20,
    overflow: "hidden",
    zIndex: 10,
    elevation: 10,
  },
  leftNotchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F5F6FB",
    borderWidth: 1,
    borderColor: "#919EAB33",
    position: "absolute",
    left: -10,
    top: 0,
  },
  rightNotchWrapper: {
    position: "absolute",
    right: 0,
    bottom: 46, // Center exactly at the 56px divider line (56 - 20/2)
    width: 10,
    height: 20,
    overflow: "hidden",
    zIndex: 10,
    elevation: 10,
  },
  rightNotchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F5F6FB",
    borderWidth: 1,
    borderColor: "#919EAB33",
    position: "absolute",
    right: -10,
    top: 0,
  },
});
