import { BillDetailsSheet } from "@/src/components/cart/BillDetailsSheet";
import { CareSureCoinsSheet } from "@/src/components/cart/CareSureCoinsSheet";
import { LocationBottomSheet } from "@/src/components/home/sections";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useCartCalculations } from "@/src/hooks/useCartCalculations";
import { PERF_TRACES, usePerformanceTrace } from "@/src/services/firebase";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";
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
} from "./sections";

const SAVINGS_BANNER_ENTERING = FadeInDown.duration(220).reduceMotion(
  ReduceMotion.System,
);
const SAVINGS_BANNER_EXITING = FadeOutUp.duration(180).reduceMotion(
  ReduceMotion.System,
);
const CART_CONTENT_LAYOUT = LinearTransition.duration(220).reduceMotion(
  ReduceMotion.System,
);

export const CartLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();

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
    corporateCreditsBalance,
    corporateCreditsEligible,
    corporateCreditsRemainingForEligibility,
    handleAddItem,
    handleProceed,
    updateItem,
    removeItem,
    firstName,
    isCartLoading,
  } = useCartCalculations();

  const { addresses, loaded: addressLoaded } = useAddress();
  const hasAddress = addressLoaded && addresses.length > 0;
  const addressActionLabel = hasAddress ? "Change Address" : "Add Address";

  const shouldShowSavingsBanner = totalSavings > 0;

  // Measures how long the cart takes to load its server data, not screen dwell.
  usePerformanceTrace({
    traceName: PERF_TRACES.CART_LOAD,
    isLoading: isCartLoading,
  });

  // React Query's isLoading is initial-load only. Do not replace an already
  // restored cart during mutations or background work.
  if (isCartLoading && lines.length === 0) {
    return (
      <View className="flex-1 bg-[#F5F6FB]">
        <ScreenHeader title="Cart" showBorder={true} />
        <CartInitialSkeleton />
      </View>
    );
  }

  if (lines.length === 0) {
    return (
      <View className="flex-1 bg-[#F5F6FB]">
        <ScreenHeader title="Cart" showBorder={true} />
        <CartEmptyState
          featuredProducts={featuredProducts}
          onAddItem={handleAddItem}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="Cart" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        contentContainerStyle={{ paddingBottom: exactScale(24) }}
      >
        {shouldShowSavingsBanner && (
          <Animated.View
            entering={SAVINGS_BANNER_ENTERING}
            exiting={SAVINGS_BANNER_EXITING}
            layout={CART_CONTENT_LAYOUT}
          >
            <CartSavingsBanner
              firstName={firstName}
              totalSavings={totalSavings}
            />
          </Animated.View>
        )}

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
            />
          )}

          {corporateCreditsBalance > 0 && (
            <CartCorporateCreditsSection
              value={corporateCreditsOn}
              balance={corporateCreditsBalance}
              onToggle={handleCorporateCreditsToggle}
              eligible={corporateCreditsEligible}
              remainingForEligibility={corporateCreditsRemainingForEligibility}
            />
          )}

          {availableCoins > 0 && (
            <CartCoinsSection
              value={coinsOn}
              availableCoins={availableCoins}
              redeemedCoins={Math.round(COINS_DISCOUNT / coinValue)}
              onToggle={handleCoinsToggle}
              onInfoPress={() => setShowCoinsSheet(true)}
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
      </ScrollView>

      <CartFooter
        toPay={toPay}
        safeAreaBottom={adjustedBottom}
        onProceed={handleProceed}
        canProceed={chargesReady}
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
