import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { useCart } from "@/src/hooks/queries/useCart";
import { useCoupons } from "@/src/hooks/queries/useCoupons";
import { useCouponAvailability } from "@/src/hooks/useCouponAvailability";
import { useCouponSearch } from "@/src/hooks/useCouponSearch";
import { useNav } from "@/src/hooks/useNav";
import { couponService } from "@/src/services/coupon.service";
import { useCouponStore } from "@/src/store/couponStore";
import { useToastStore } from "@/src/store/toastStore";
import { moderateScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { CouponCard, CouponCardSkeleton, CouponInput } from "./sections";

export const CouponsLayout: React.FC = () => {
  const [couponCode, setCouponCode] = useState("");
  const [validating, setValidating] = useState(false);
  const { apply, applied } = useCouponStore();
  const toast = useToastStore();
  const router = useNav();
  const { totalPrice: subtotal } = useCart();
  const { data: coupons = [], isLoading } = useCoupons();
  const { unavailable } = useCouponAvailability(coupons, subtotal);
  const visibleCoupons = useCouponSearch(coupons, couponCode);
  const shouldShowInitialShimmer = isLoading && coupons.length === 0;

  const applyCode = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setValidating(true);
    try {
      const result = await couponService.validateCoupon(trimmed, subtotal);
      if (result.valid) {
        apply({
          code: trimmed,
          discount: Number(result.discount) || 0,
          description: result.message ?? "",
        });
        // transition makes Fabric re-parent views and crash.
        requestAnimationFrame(() => router.back());
      } else {
        toast.show(
          result.message ?? "This coupon is not valid or has expired.",
          "error",
        );
      }
    } catch (err) {
      // Surface the backend's reason (e.g. "usage limit reached") when the
      // coupon is rejected via a 4xx, instead of a generic fallback.
      const message = err instanceof Error ? err.message : "";
      toast.show(
        message || "Could not validate coupon. Please try again.",
        "error",
      );
    } finally {
      setValidating(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="Apply Coupon" />

      {/* Fixed search bar — stays pinned while only the coupon list scrolls */}
      <View className="px-4 pt-6">
        <CouponInput
          value={couponCode}
          onChangeText={setCouponCode}
          onApply={() => applyCode(couponCode)}
          loading={validating}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        <Text
          className="font-inter-bold text-brand-text mb-4"
          style={{ fontSize: moderateScale(14) }}
        >
          Featured Coupons
        </Text>

        {shouldShowInitialShimmer ? (
          <>
            <CouponCardSkeleton />
            <CouponCardSkeleton />
            <CouponCardSkeleton />
          </>
        ) : visibleCoupons.length === 0 ? (
          <Text
            className="font-inter-medium text-brand-subtext text-center mt-4"
            style={{ fontSize: moderateScale(13) }}
          >
            {coupons.length === 0
              ? "No coupons available"
              : "No coupons match that code"}
          </Text>
        ) : (
          visibleCoupons.map((coupon) => {
            const isApplied =
              applied?.code?.toUpperCase() === coupon.code?.toUpperCase();
            // Failed pre-validation despite meeting the min order
            // (e.g. usage limit reached) → show inactive. The
            // min-order case is already covered by `disabled`.
            const isUnavailable =
              !isApplied &&
              subtotal >= coupon.minOrderValue &&
              unavailable.has(coupon.code);
            return (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onApply={applyCode}
                disabled={subtotal < coupon.minOrderValue}
                isApplied={isApplied}
                isUnavailable={isUnavailable}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
};
