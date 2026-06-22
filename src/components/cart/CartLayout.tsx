import { BillDetailsSheet } from "@/src/components/cart/BillDetailsSheet";
import { CareSureCoinsSheet } from "@/src/components/cart/CareSureCoinsSheet";
import { LocationBottomSheet } from "@/src/components/home/sections";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useCartCalculations } from "@/src/hooks/useCartCalculations";
import React from "react";
import { ScrollView, View } from "react-native";
import {
    CartBillSummary,
    CartCoinsSection,
    CartConfetti,
    CartCouponSection,
    CartDeliveringTo,
    CartEmptyState,
    CartFooter,
    CartFreeDeliveryProgress,
    CartItemsList,
    CartSavingsBanner,
    CartSavingsBreakdown,
    CartTerms,
    CartWalletSection,
} from "./sections";

export const CartLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const {
    walletOn,
    coinsOn,
    confettiTrigger,
    handleWalletToggle,
    handleCoinsToggle,
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
    HANDLING_CHARGE,
    COUPON_DISCOUNT,
    COINS_DISCOUNT,
    WALLET_DISCOUNT,
    toPay,
    savingsRows,
    totalSavings,
    remainingForFreeDelivery,
    freeDeliveryProgress,
    featuredProducts,
    availableCoins,
    walletBalance,
    handleAddItem,
    handleProceed,
    setSelectedLocation,
    updateItem,
    removeItem,
    firstName,
  } = useCartCalculations();

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
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <CartDeliveringTo
          label={deliveryLocation?.label ?? defaultAddress?.label ?? "Address"}
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
          flat
        />

        <CartSavingsBanner firstName={firstName} totalSavings={totalSavings} />

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

        <CartSavingsBreakdown totalSavings={totalSavings} rows={savingsRows} />

        <CartTerms />
      </ScrollView>

      <CartFooter
        toPay={toPay}
        safeAreaBottom={adjustedBottom}
        onProceed={handleProceed}
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
        onSelect={(label, city) => setSelectedLocation({ label, city })}
      />

      <CartConfetti trigger={confettiTrigger} />
    </View>
  );
};

