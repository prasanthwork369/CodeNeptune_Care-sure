import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { useCouponStore } from "@/src/store/couponStore";
import { useNav } from "@/src/hooks/useNav";
import React, { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { CouponCard } from "./sections/CouponCard";
import { CouponInput } from "./sections/CouponInput";
import { moderateScale } from "@/src/utils/exactScale";

const MOCK_COUPONS = [
  {
    id: "1",
    title: "Save ₹100",
    description: "Flat ₹100 off on orders above ₹499",
    code: "CARE10",
    discount: 100,
  },
  {
    id: "2",
    title: "Save ₹150",
    description: "Flat ₹150 off on orders above ₹699",
    code: "SAVE150",
    discount: 150,
  },
  {
    id: "3",
    title: "Save ₹50",
    description: "Flat ₹50 off on first order",
    code: "FIRST50",
    discount: 50,
  },
  {
    id: "4",
    title: "Save ₹200",
    description: "Flat ₹200 off on orders above ₹999",
    code: "CARE200",
    discount: 200,
  },
];

export const CouponsLayout: React.FC = () => {
  const [couponCode, setCouponCode] = useState("");
  const { apply } = useCouponStore();
  const router = useNav();

  const handleApply = (code: string, discount: number, description: string) => {
    apply({ code, discount, description });
    router.back();
  };

  const handleManualApply = () => {
    const code = couponCode.trim().toUpperCase();
    const found = MOCK_COUPONS.find((c) => c.code === code);
    if (found) {
      handleApply(found.code, found.discount, found.description);
    } else {
      Alert.alert(
        "Invalid Coupon",
        "This coupon code is not valid or has expired.",
      );
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="Apply Coupon" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4 pt-6"
      >
        <CouponInput
          value={couponCode}
          onChangeText={setCouponCode}
          onApply={handleManualApply}
        />

        <Text className="font-inter-bold text-brand-text mt-8 mb-4" style={{ fontSize: moderateScale(14) }}>
          More Coupons
        </Text>

        {MOCK_COUPONS.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} onApply={handleApply} />
        ))}
      </ScrollView>
    </View>
  );
};
