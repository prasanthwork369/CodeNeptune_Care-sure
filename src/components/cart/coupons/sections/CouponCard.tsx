import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { CouponCardProps, COUPON_DISCOUNT_TYPE } from "@/src/types/cart";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onApply }) => {
  const isPercentage = coupon.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE;
  const discountLabel = isPercentage ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`;
  const description = isPercentage
    ? `${coupon.discountValue}% off on orders above ₹${coupon.minOrderValue}${coupon.maxDiscountAmount ? `, max ₹${coupon.maxDiscountAmount}` : ''}`
    : `₹${coupon.discountValue} off on orders above ₹${coupon.minOrderValue}`;

  return (
    <View className="mb-4 relative">
      <View className="bg-white rounded-[16px] border border-[#919EAB33]">
        <View className="p-4 flex-row items-center overflow-hidden rounded-t-[16px]">
          <View className="w-10 h-10 rounded-md bg-white border border-[#919EAB33] items-center justify-center p-1.5">
            <icons.percent_discount width={22} height={22} fill={colors.primary} />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-[14px] font-inter-semibold text-[#000000]">{discountLabel}</Text>
            <Text style={{ color: "#E53827" }} className="text-[12px] font-inter-medium mt-0.5">{description}</Text>
            <Text className="text-[11px] font-inter-medium text-[#919EAB] mt-0.5">
              Expires {formatExpiry(coupon.expiresAt)}
            </Text>
          </View>
          <View style={styles.fadedIconContainer}>
            <icons.percent_discount width={60} height={60} fill="#0F7635" opacity={0.09} />
          </View>
        </View>
        <View style={styles.dashedDivider} />
        <View className="px-4 py-3.5 flex-row items-center justify-between bg-[#FAFAFA] rounded-b-[16px]">
          <Text className="text-[12px] font-inter-semibold text-[#000000] tracking-wider">{coupon.code}</Text>
          <Touchable
            onPress={() => onApply(coupon.code)}
            style={{ backgroundColor: colors.primary }}
            className="px-3 py-2 rounded-md"
          >
            <Text className="text-[12px] font-inter-bold text-white">APPLY</Text>
          </Touchable>
        </View>
      </View>
      <View style={styles.leftNotch} />
      <View style={styles.rightNotch} />
    </View>
  );
};

const styles = StyleSheet.create({
  fadedIconContainer: { position: "absolute", right: -15, top: -10, zIndex: -1 },
  dashedDivider: { height: 1, width: "100%", borderWidth: 1, borderColor: "#919EAB33", borderStyle: "dashed", borderRadius: 1 },
  leftNotch: { position: "absolute", left: -10, top: 72, width: 20, height: 20, borderRadius: 10, backgroundColor: "#F5F6FB", borderWidth: 1, borderColor: "#919EAB33", zIndex: 10 },
  rightNotch: { position: "absolute", right: -10, top: 72, width: 20, height: 20, borderRadius: 10, backgroundColor: "#F5F6FB", borderWidth: 1, borderColor: "#919EAB33", zIndex: 10 },
});
