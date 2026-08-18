import type { Coupon } from "@/src/features/cart/types";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { useCart } from "@/src/features/cart/hooks/useCart";
import { useCoupons } from "@/src/features/cart/hooks/useCoupons";
import { useCouponAvailability } from "@/src/features/cart/hooks/useCouponAvailability";
import { useCouponSearch } from "@/src/features/cart/hooks/useCouponSearch";
import { useNav } from "@/src/hooks/useNav";
import { couponApi } from "../api/coupon.api";
import { useCouponStore } from "@/src/store/couponStore";
import { useToastStore } from "@/src/store/toastStore";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  BackHandler,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { CouponCard, CouponCardSkeleton, CouponInput } from "../coupons";
import { requireInternet } from "@/src/utils/offline";

const EMPTY_COUPONS: Coupon[] = [];

// One skeleton card: 115 body + 12 bottom margin
const SKELETON_CARD_HEIGHT = 127;
// Header, search input and section title sitting above the list
const SKELETON_LIST_OFFSET = 260;

export const CouponsLayout: React.FC = () => {
  const [couponCode, setCouponCode] = useState("");
  const [validatingCode, setValidatingCode] = useState<string | null>(null);
  const apply = useCouponStore((s) => s.apply);
  const applied = useCouponStore((s) => s.applied);
  const showToast = useToastStore((s) => s.show);
  const router = useNav();
  const { height: screenHeight } = useWindowDimensions();
  const { totalPrice: subtotal, isLoading: isCartLoading } = useCart();
  const { data: rawCoupons, isLoading } = useCoupons();
  const coupons = rawCoupons ?? EMPTY_COUPONS;
  const unavailable = useCouponAvailability(coupons);
  const visibleCoupons = useCouponSearch(coupons, couponCode);

  // Subtotal drives every min-order state, so painting before the cart lands
  // would show each coupon as eligible and then grey it out.
  const shouldShowInitialShimmer =
    (isLoading && coupons.length === 0) || isCartLoading;

  // Fills the viewport so the placeholder reads as a full list rather than a short stub
  const skeletonCount = Math.max(
    3,
    Math.ceil(
      (screenHeight - exactScale(SKELETON_LIST_OFFSET)) /
        exactScale(SKELETON_CARD_HEIGHT),
    ),
  );

  // Same Fabric re-parent conflict as the header's back button (see onBack
  // below) via the Android hardware back button instead — that pop isn't
  // routed through onBack at all, so it needs its own defer.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          requestAnimationFrame(() => router.back());
          return true;
        },
      );
      return () => subscription.remove();
    }, [router]),
  );

  const applyCode = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    // Gate before the loader: an offline tap must look inert, not busy.
    if (!requireInternet()) return;
    setValidatingCode(trimmed);
    try {
      const result = await couponApi.validateCoupon(trimmed, subtotal);
      if (result.valid) {
        apply({
          code: trimmed,
          discount: Number(result.discount) || 0,
          description: result.message ?? "",
        });
        // transition makes Fabric re-parent views and crash.
        requestAnimationFrame(() => router.back());
      } else {
        showToast(
          result.message ?? "This coupon is not valid or has expired.",
          "error",
        );
      }
    } catch (err) {
      // Surface the backend's reason (e.g. "usage limit reached") when the
      // coupon is rejected via a 4xx, instead of a generic fallback.
      const message = err instanceof Error ? err.message : "";
      showToast(
        message || "Could not validate coupon. Please try again.",
        "error",
      );
    } finally {
      setValidatingCode(null);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title="Apply Coupon"
        // Same defer as applyCode below: this screen's coupon/cart queries can
        // still be mid-render (skeleton -> list swap) when back is tapped —
        // starting the pop transition in that same tick is the Fabric
        // re-parent crash this file already had to fix once.
        onBack={() => requestAnimationFrame(() => router.back())}
      />

      {/* Fixed search bar — stays pinned while only the coupon list scrolls */}
      <View
        style={{
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(32),
        }}
      >
        <CouponInput
          value={couponCode}
          onChangeText={setCouponCode}
          onApply={() => applyCode(couponCode)}
          loading={validatingCode !== null}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(18),
          paddingBottom: exactScale(40),
        }}
      >
        <Text
          className="font-inter-bold text-brand-text"
          style={{
            fontSize: moderateScale(16),
            lineHeight: moderateScale(21),
            marginBottom: exactScale(14),
          }}
        >
          Featured Coupons
        </Text>

        {shouldShowInitialShimmer ? (
          Array.from({ length: skeletonCount }, (_, i) => (
            <CouponCardSkeleton key={i} />
          ))
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
              applied?.code?.trim().toUpperCase() ===
              coupon.code?.trim().toUpperCase();
            // Failed pre-validation despite meeting the min order
            // (e.g. usage limit reached) → show inactive. The
            // min-order case is already covered by `disabled`.
            const isUnavailable =
              !isApplied &&
              subtotal >= coupon.minOrderValue &&
              unavailable.has(coupon.code);
            const isCardValidating =
              validatingCode !== null &&
              validatingCode === coupon.code.toUpperCase();
            return (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onApply={applyCode}
                disabled={subtotal < coupon.minOrderValue}
                isApplied={isApplied}
                isUnavailable={isUnavailable}
                loading={isCardValidating}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
};
