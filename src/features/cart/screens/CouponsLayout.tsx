import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import {
  SKELETON_CARD_HEIGHT,
  SKELETON_LIST_OFFSET,
} from "@/src/features/cart/constants/cart.constants";
import { useCart } from "@/src/features/cart/hooks/useCart";
import {
  useCouponAvailability,
  useCoupons,
  useCouponSearch,
} from "@/src/features/cart/hooks/useCoupons";
import type { Coupon } from "@/src/features/cart/types";
import { useNav } from "@/src/hooks/useNav";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { useCouponStore } from "@/src/store/couponStore";
import { useToastStore } from "@/src/store/toastStore";
import { exactScale } from "@/src/utils/exactScale";
import { requireInternet } from "@/src/utils/offline";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  BackHandler,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { couponApi } from "../api/coupon.api";
import { CouponCard, CouponCardSkeleton, CouponInput } from "../coupons";
import { styles as s } from "./CouponsLayout.styles";

const EMPTY_COUPONS: Coupon[] = [];

export const CouponsLayout: React.FC = () => {
  const [couponCode, setCouponCode] = useState("");
  const [validatingCode, setValidatingCode] = useState<string | null>(null);
  const apply = useCouponStore((st) => st.apply);
  const applied = useCouponStore((st) => st.applied);
  const showToast = useToastStore((st) => st.show);
  const router = useNav();
  const { height: screenHeight } = useWindowDimensions();
  const { totalPrice: subtotal, isLoading: isCartLoading } = useCart();
  const {
    data: rawCoupons,
    isLoading,
    isFetching: isCouponsFetching,
    error: couponsError,
    refetch: refetchCoupons,
  } = useCoupons();
  const couponsErrorState = useQueryErrorState(couponsError);
  const coupons = rawCoupons ?? EMPTY_COUPONS;
  const unavailable = useCouponAvailability(coupons);
  const visibleCoupons = useCouponSearch(coupons, couponCode);

  const shouldShowInitialShimmer =
    (isLoading && coupons.length === 0) || isCartLoading;

  const skeletonCount = Math.max(
    3,
    Math.ceil(
      (screenHeight - exactScale(SKELETON_LIST_OFFSET)) /
        exactScale(SKELETON_CARD_HEIGHT),
    ),
  );

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
    if (!requireInternet()) return;
    setValidatingCode(trimmed);
    let navigating = false;
    try {
      const result = await couponApi.validateCoupon(trimmed, subtotal);
      if (result.valid) {
        apply({
          code: trimmed,
          discount: Number(result.discount) || 0,
          description: result.message ?? "",
        });
        navigating = true;
        requestAnimationFrame(() => {
          router.back();
          setValidatingCode(null);
        });
      } else {
        showToast(
          result.message ?? "This coupon is not valid or has expired.",
          "error",
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      showToast(
        message || "Could not validate coupon. Please try again.",
        "error",
      );
    } finally {
      if (!navigating) setValidatingCode(null);
    }
  };

  const screenHeaderProps = {
    title: "Apply Coupon",
    onBack: () => requestAnimationFrame(() => router.back()),
  };

  if (
    !shouldShowInitialShimmer &&
    coupons.length === 0 &&
    couponsErrorState === "offline"
  ) {
    return (
      <View style={s.root}>
        <ScreenHeader {...screenHeaderProps} />
        <NoInternetState
          onRetry={() => void refetchCoupons()}
          retrying={isCouponsFetching}
        />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScreenHeader {...screenHeaderProps} />

      <View style={s.searchWrap}>
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
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
      >
        <Text style={s.sectionTitle}>Featured Coupons</Text>

        {shouldShowInitialShimmer ? (
          Array.from({ length: skeletonCount }, (_, i) => (
            <CouponCardSkeleton key={i} />
          ))
        ) : couponsErrorState && coupons.length === 0 ? (
          <RetryState
            title="Couldn't load coupons"
            onRetry={() => void refetchCoupons()}
            retrying={isCouponsFetching}
          />
        ) : visibleCoupons.length === 0 ? (
          <Text style={s.emptyText}>
            {coupons.length === 0
              ? "No coupons available"
              : "No coupons match that code"}
          </Text>
        ) : (
          visibleCoupons.map((coupon) => {
            const isApplied =
              applied?.code?.trim().toUpperCase() ===
              coupon.code?.trim().toUpperCase();
            const isUnavailable =
              !isApplied && unavailable.has(coupon.code);
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
