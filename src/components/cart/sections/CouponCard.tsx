import { icons } from "@/src/constants/icons";
import { cartStyles as s } from '../cart.styles';
import { colors } from "@/src/constants/theme";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface LocalCouponCardProps {
  coupon: {
    id: string;
    title: string;
    description: string;
    code: string;
    discount: number;
  };
  onApply: (code: string, discount: number, description: string) => void;
}

export const CouponCard: React.FC<LocalCouponCardProps> = ({ coupon, onApply }) => {
  return (
    <View className="mb-4 relative">
      <View className="bg-white rounded-[16px] border border-[#919EAB33]">
        <View className="p-4 flex-row items-center overflow-hidden rounded-t-[16px]">
          <View style={[s.couponIconBox, { borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#919EAB33', alignItems: 'center', justifyContent: 'center', padding: 6 }]}>
            <icons.percent_discount
              width={s.couponIcon.width}
              height={s.couponIcon.height}
              fill={colors.primary}
            />
          </View>
          <View className="ml-4 flex-1">
            <Text style={s.couponCardTitle} className="font-inter-semibold text-[#000000]">
              {coupon.title}
            </Text>
            <Text
              className="font-inter-medium mt-0.5"
              style={[s.couponCardDesc, { color: "#E53827" }]}
            >
              {coupon.description}
            </Text>
          </View>
          <View style={styles.fadedIconContainer}>
            <icons.percent_discount
              width={60}
              height={60}
              fill="#0F7635"
              opacity={0.09}
            />
          </View>
        </View>
        <View style={styles.dashedDivider} />
        <View className="px-4 py-3.5 flex-row items-center justify-between bg-[#FAFAFA] rounded-b-[16px]">
          <Text style={s.couponCode} className="font-inter-semibold text-[#000000] tracking-wider">
            {coupon.code}
          </Text>
          <Touchable
            onPress={() =>
              onApply(coupon.code, coupon.discount, coupon.description)
            }
            style={{ backgroundColor: colors.primary }}
            className="px-3 py-2 rounded-lg"
          >
            <Text style={s.couponApply} className="font-inter-bold text-white">
              APPLY
            </Text>
          </Touchable>
        </View>
      </View>
      <View style={styles.leftNotch} />
      <View style={styles.rightNotch} />
    </View>
  );
};

const styles = StyleSheet.create({
  fadedIconContainer: {
    position: "absolute",
    right: -15,
    top: -10,
    zIndex: -1,
  },
  dashedDivider: {
    height: 1,
    width: "100%",
    borderWidth: 1,
    borderColor: "#919EAB33",
    borderStyle: "dashed",
    borderRadius: 1,
  },
  leftNotch: {
    position: "absolute",
    left: -10,
    top: 72,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F5F6FB",
    borderWidth: 1,
    borderColor: "#919EAB33",
    zIndex: 10,
  },
  rightNotch: {
    position: "absolute",
    right: -10,
    top: 72,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F5F6FB",
    borderWidth: 1,
    borderColor: "#919EAB33",
    zIndex: 10,
  },
});
