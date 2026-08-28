import { LocationBottomSheet } from "@/src/components/location/LocationBottomSheet";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { BillDetailsSheet } from "@/src/features/cart/components/BillDetailsSheet";
import { CareSureCoinsSheet } from "@/src/features/cart/components/CareSureCoinsSheet";
import {
  CART_CONTENT_LAYOUT,
  SAVINGS_BANNER_ENTERING,
  SAVINGS_BANNER_EXITING,
} from "@/src/features/cart/constants/cart.constants";
import { useCartCalculations } from "@/src/features/cart/hooks/useCartCalculations";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { PERF_TRACES, usePerformanceTrace } from "@/src/services/firebase";
import { useAuthStore } from "@/src/store/authStore";
import { useCartPendingStore } from "@/src/store/cartStore";
import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { styles as s } from "./CartLayout.styles";
import {
  CartBillSummary,
  CartCoinsSection,
  CartConfetti,
  CartCorporateCreditsSection,
  CartCouponSection,
  CartDeliveringTo,
  CartEmptyState,
  CartFooter,
  CartFreeDeliveryProgress,
  CartInitialSkeleton,
  CartItemsList,
  CartSavingsBanner,
  CartSavingsBreakdown,
  CartTerms,
  CartWalletSection,
} from "../sections";

export const CartLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const hasPendingCartAction = useCartPendingStore((state) =>
    Object.values(state.pendingIds).some(Boolean),
  );

  const {
    walletOn,
    coinsOn,
    corporateCreditsOn,
    confettiTrigger,
    handleWalletToggle,
    handleCoinsToggle,
    handleCorporateCreditsToggle,
    appliedCoupon,
    removeCoupon,
    deliveryLocation,
    defaultAddress,
    hasSavedAddress,
    showBillDetails,
    setShowBillDetails,
    showCoinsSheet,
    setShowCoinsSheet,
    showLocationSheet,
    setShowLocationSheet,
    lines,
    subtotal,
    mrpTotal,
    productSavings,
    coinValue,
    DELIVERY_FEE,
    chargesReady,
    HANDLING_CHARGE,
    COUPON_DISCOUNT,
    COINS_DISCOUNT,
    WALLET_DISCOUNT,
    CORPORATE_CREDITS_DISCOUNT,
    toPay,
    savingsRows,
    totalSavings,
    remainingForFreeDelivery,
    freeDeliveryProgress,
    featuredProducts,
    availableCoins,
    walletBalance,
    walletHasRemainingAmount,
    coinsHasRemainingAmount,
    corporateCreditsBalance,
    corporateCreditsEligible,
    corporateCreditsRemainingForEligibility,
    corporateCreditsHasRemainingAmount,
    handleAddItem,
    handleProceed,
    updateItem,
    removeItem,
    firstName,
    isCartLoading,
    isCartFetching,
    cartError,
    refetchCart,
  } = useCartCalculations();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const liveState = useLiveScreenState({
    error: cartError,
    hasData: lines.length > 0,
    loading: isCartLoading,
    live: isAuthenticated,
  });

  const addressActionLabel = hasSavedAddress ? "Change" : "Add Address";
  const hasRxItem = lines.some((line) => line.rx);
  const shouldShowSavingsBanner = totalSavings > 0;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  usePerformanceTrace({
    traceName: PERF_TRACES.CART_LOAD,
    isLoading: isCartLoading,
  });

  if (liveState === "offline") {
    return (
      <View style={s.root}>
        <ScreenHeader title="Cart" showBorder={true} />
        <NoInternetState
          onRetry={() => void refetchCart()}
          retrying={isCartFetching}
        />
      </View>
    );
  }

  if (isCartLoading && lines.length === 0) {
    return (
      <View style={s.root}>
        <ScreenHeader title="Cart" showBorder={true} />
        <CartInitialSkeleton />
      </View>
    );
  }

  if (liveState === "error") {
    return (
      <View style={s.root}>
        <ScreenHeader title="Cart" showBorder={true} />
        <RetryState
          title="Couldn't load your cart"
          onRetry={() => void refetchCart()}
          retrying={isCartFetching}
        />
      </View>
    );
  }

  if (lines.length === 0) {
    return (
      <View style={s.root}>
        <ScreenHeader title="Cart" showBorder={true} />
        <CartEmptyState
          featuredProducts={featuredProducts}
          onAddItem={handleAddItem}
        />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScreenHeader title="Cart" />

      {shouldShowSavingsBanner && (
        <Animated.View
          entering={SAVINGS_BANNER_ENTERING}
          exiting={SAVINGS_BANNER_EXITING}
        >
          <CartSavingsBanner
            firstName={firstName}
            totalSavings={totalSavings}
            scrollY={scrollY}
          />
        </Animated.View>
      )}

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        contentContainerStyle={s.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View layout={CART_CONTENT_LAYOUT}>
          <CartDeliveringTo
            label={
              deliveryLocation?.label ?? defaultAddress?.label ?? "Address"
            }
            description={
              deliveryLocation?.city ??
              (defaultAddress
                ? [
                    defaultAddress.line1,
                    defaultAddress.line2,
                    defaultAddress.city,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : "No address saved")
            }
            onChange={() => setShowLocationSheet(true)}
            actionLabel={addressActionLabel}
            flat
          />

          <CartFreeDeliveryProgress
            remainingForFreeDelivery={remainingForFreeDelivery}
            progress={freeDeliveryProgress}
          />

          <CartItemsList
            lines={lines}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />

          <CartCouponSection
            appliedCoupon={appliedCoupon}
            onRemove={removeCoupon}
            subtotal={subtotal}
          />

          {walletBalance > 0 && (
            <CartWalletSection
              value={walletOn}
              walletBalance={walletBalance}
              onToggle={handleWalletToggle}
              hasRemainingAmount={walletHasRemainingAmount}
              discountApplied={WALLET_DISCOUNT}
            />
          )}

          {corporateCreditsBalance > 0 && (
            <CartCorporateCreditsSection
              value={corporateCreditsOn}
              balance={corporateCreditsBalance}
              onToggle={handleCorporateCreditsToggle}
              eligible={corporateCreditsEligible}
              remainingForEligibility={corporateCreditsRemainingForEligibility}
              hasRemainingAmount={corporateCreditsHasRemainingAmount}
              discountApplied={CORPORATE_CREDITS_DISCOUNT}
            />
          )}

          {availableCoins > 0 && (
            <CartCoinsSection
              value={coinsOn}
              availableCoins={availableCoins}
              redeemedCoins={Math.round(COINS_DISCOUNT / coinValue)}
              onToggle={handleCoinsToggle}
              onInfoPress={() => setShowCoinsSheet(true)}
              hasRemainingAmount={coinsHasRemainingAmount}
            />
          )}

          <CartBillSummary
            mrpTotal={mrpTotal + DELIVERY_FEE + HANDLING_CHARGE}
            toPay={toPay}
            onPress={() => setShowBillDetails(true)}
          />

          <CartSavingsBreakdown
            totalSavings={totalSavings}
            rows={savingsRows}
          />

          <CartTerms />
        </Animated.View>
      </Animated.ScrollView>

      <CartFooter
        toPay={toPay}
        safeAreaBottom={adjustedBottom}
        onProceed={handleProceed}
        canProceed={chargesReady && !hasPendingCartAction}
        hasRxItem={hasRxItem}
      />

      <BillDetailsSheet
        isVisible={showBillDetails}
        onClose={() => setShowBillDetails(false)}
        linesCount={lines.length}
        mrpTotal={mrpTotal}
        productSavings={productSavings}
        couponDiscount={COUPON_DISCOUNT}
        walletDiscount={WALLET_DISCOUNT}
        coinsDiscount={COINS_DISCOUNT}
        corporateCreditsDiscount={CORPORATE_CREDITS_DISCOUNT}
        deliveryFee={DELIVERY_FEE}
        handlingCharge={HANDLING_CHARGE}
        toPay={toPay}
      />
      <CareSureCoinsSheet
        isVisible={showCoinsSheet}
        onClose={() => setShowCoinsSheet(false)}
        availableCoins={availableCoins}
        savedAmount={COINS_DISCOUNT}
        coinValue={coinValue}
      />
      <LocationBottomSheet
        isVisible={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
        title={addressActionLabel}
      />

      <CartConfetti trigger={confettiTrigger} />
    </View>
  );
};
