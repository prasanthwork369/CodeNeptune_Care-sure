import { BillDetailsSheet } from "@/src/features/cart/components/BillDetailsSheet";
import { CareSureCoinsSheet } from "@/src/features/cart/components/CareSureCoinsSheet";
import { CartBillSummary } from "@/src/features/cart/sections/CartBillSummary";
import { CartCoinsSection } from "@/src/features/cart/sections/CartCoinsSection";
import { CartConfetti } from "@/src/features/cart/sections/CartConfetti";
import { CartCouponSection } from "@/src/features/cart/sections/CartCouponSection";
import { CartDeliveringTo } from "@/src/features/cart/sections/CartDeliveringTo";
import { CartFooter } from "@/src/features/cart/sections/CartFooter";
import { CartSavingsBreakdown } from "@/src/features/cart/sections/CartSavingsBreakdown";
import { CartTerms } from "@/src/features/cart/sections/CartTerms";
import {
  CartWalletSection,
  CartCorporateCreditsSection,
} from "@/src/features/cart/sections";
import { LocationBottomSheet } from "@/src/components/location/LocationBottomSheet";
import { useDeliveryAddress } from "@/src/hooks/useDeliveryAddress";
import { useRefillReminder } from "@/src/hooks/useRefillReminder";
import { ReminderSheet } from "@/src/features/prescription/components/ReminderSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { useBillingCalculations } from "@/src/hooks/useBillingCalculations";
import { useDeliveryCharges } from "@/src/hooks/useDeliveryCharges";
import { useNav } from "@/src/hooks/useNav";
import { useCheckoutStore } from "@/src/store/checkoutStore";
import { useCouponStore } from "@/src/store/couponStore";
import { usePrescriptionOrderStore } from "@/src/store/prescriptionOrderStore";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import React, { useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import {
  AnimatedComparisonHeader,
  ComparisonCard,
  RefillReminder,
  SavingsBanner,
} from "../sections/medicine-comparison";

import { MedicineComparisonSkeleton } from "../components/MedicineComparisonSkeleton";
import { useComparisonPrescriptionId } from "../hooks/useComparisonPrescriptionId";
import { usePrescriptionOrderMedicines } from "@/src/hooks/queries/usePrescriptionOrderMedicines";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";

import { ComparisonMedicine } from "../medicine-comparison.types";

interface MedicineComparisonLayoutProps {
  medicines?: ComparisonMedicine[];
  prescriptionId?: string;
  prescriptionOrderId?: string;
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export const MedicineComparisonLayout: React.FC<
  MedicineComparisonLayoutProps
> = ({
  medicines: propsMedicines,
  prescriptionId: propsPrescriptionId,
  prescriptionOrderId: propsPrescriptionOrderId,
}) => {
  const params = useLocalSearchParams<{
    prescriptionOrderId?: string;
    prescriptionId?: string;
  }>();

  const prescriptionOrderId =
    propsPrescriptionOrderId ?? params.prescriptionOrderId;
  const rawPrescriptionId = propsPrescriptionId ?? params.prescriptionId;

  const {
    medicines: queryMedicines,
    isLoading,
    refetch,
  } = usePrescriptionOrderMedicines(
    propsMedicines ? "" : (prescriptionOrderId ?? ""),
  );

  const resolvedPrescriptionId = useComparisonPrescriptionId(
    rawPrescriptionId,
    prescriptionOrderId,
  );

  const medicines = propsMedicines ?? queryMedicines;

  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;

  const setPrescriptionOrderItems = usePrescriptionOrderStore(
    (s) => s.setItems,
  );
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [walletOn, setWalletOn] = useState(false);
  const [coinsOn, setCoinsOn] = useState(false);
  const [corporateCreditsOn, setCorporateCreditsOn] = useState(false);
  const [showCoinsSheet, setShowCoinsSheet] = useState(false);
  const [showReminderSheet, setShowReminderSheet] = useState(false);
  // Server-backed refill reminder — state, API calls and error alerts live in the hook.
  const refill = useRefillReminder({
    prescriptionId: resolvedPrescriptionId,
    prescriptionOrderId,
  });
  const [medicinesSectionLayout, setMedicinesSectionLayout] = useState({
    y: 0,
    height: 0,
  });
  const scrollYShared = useSharedValue(0);

  // Runs on the UI thread. A JS onScroll lags behind a fast fling, which left
  // the header translated up while its sticky slot had already settled —
  // showing as a gap on fast scrolls but not slow ones.
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollYShared.value = e.contentOffset.y;
    },
  });

  const playConfetti = () => setConfettiTrigger((n) => n + 1);

  const handleWalletToggle = (v: boolean) => {
    setWalletOn(v);
    if (v) playConfetti();
  };

  const handleCoinsToggle = () => {
    setCoinsOn((v) => {
      const next = !v;
      if (next) playConfetti();
      return next;
    });
  };

  // Delivery location — the resolved address the order will actually ship to.
  const { address: defaultAddress, displayLocation } = useDeliveryAddress();
  const deliveryLabel =
    displayLocation?.label ?? defaultAddress?.label ?? "Address";
  const deliveryDescription = displayLocation?.city ?? "No address saved";

  // Coupon
  const appliedCoupon = useCouponStore((s) => s.applied);
  const removeCoupon = useCouponStore((s) => s.remove);

  // Merge duplicate entries for the same recommended medicine, summing quantities
  const mergedMedicines = useMemo(() => {
    const map = new Map<string, ComparisonMedicine>();
    for (const med of medicines ?? []) {
      const key = med.recommended.id;
      const existing = map.get(key);
      if (existing) {
        map.set(key, {
          ...existing,
          quantity: (existing.quantity || 1) + (med.quantity || 1),
        });
      } else {
        map.set(key, { ...med });
      }
    }
    return Array.from(map.values());
  }, [medicines]);

  // Pricing — qty based on recommended medicine quantity
  const subtotal = mergedMedicines.reduce(
    (sum, item) => sum + item.recommended.price * (item.quantity || 1),
    0,
  );
  const mrpTotal = mergedMedicines.reduce(
    (sum, item) => sum + item.recommended.mrp * (item.quantity || 1),
    0,
  );

  // Same admin-driven charges the cart applies — this screen previously hardcoded
  // them to 0, so prescription orders shipped free regardless of order value.
  const {
    isReady: chargesReady,
    deliveryFee,
    handlingCharge,
  } = useDeliveryCharges(subtotal);

  // Use reusable calculations hook
  const {
    walletBalance,
    walletHasRemainingAmount,
    availableCoins,
    maxCoinsUsable,
    coinValue,
    coinsHasRemainingAmount,
    COUPON_DISCOUNT,
    COINS_DISCOUNT,
    WALLET_DISCOUNT,
    CORPORATE_CREDITS_DISCOUNT,
    corporateCreditsBalance,
    corporateCreditsEligible,
    corporateCreditsRemainingForEligibility,
    corporateCreditsHasRemainingAmount,
    productSavings,
    toPay,
    savingsRows,
    totalSavings,
  } = useBillingCalculations({
    subtotal,
    mrpTotal,
    walletOn,
    coinsOn,
    corporateCreditsOn,
    deliveryFee,
    handlingCharge,
  });

  const handleProceed = () => {
    // Charges come from admin settings; proceeding before they land would
    // freeze a bill with no delivery or handling fee into the order.
    if (!chargesReady) return;
    setPrescriptionOrderItems(
      mergedMedicines.map((item) => ({
        medicineId: item.recommended.id,
        medicineName: item.recommended.name,
        medicineSlug: item.recommended.slug,
        unitPrice: item.recommended.price,
        mrp: item.recommended.mrp,
        discountPercent: item.recommended.discountPercent,
        quantity: item.quantity || 1,
        image:
          typeof item.recommended.image === "string"
            ? item.recommended.image
            : null,
        productId: item.recommended.productId ?? null,
      })),
    );
    useCheckoutStore.getState().setBill(
      {
        subtotal,
        productDiscount: productSavings,
        couponDiscount: COUPON_DISCOUNT,
        walletDiscount: WALLET_DISCOUNT,
        coinsDiscount: COINS_DISCOUNT,
        corporateCreditsDiscount: CORPORATE_CREDITS_DISCOUNT,
        deliveryFee,
        handlingCharge,
        totalSaved: totalSavings,
        toPay,
      },
      {
        walletUsed: walletOn,
        coinsUsed: coinsOn,
        corporateCreditsUsed: corporateCreditsOn,
        couponCode: appliedCoupon?.code ?? "",
      },
    );
    router.push({
      pathname: "/(prescription)/select-patient",
      params: {
        toPay: toPay.toFixed(2),
        prescriptionId: resolvedPrescriptionId ?? "",
      },
    });
  };

  if (!propsMedicines && isLoading) {
    return <MedicineComparisonSkeleton />;
  }

  if (!propsMedicines && medicines.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F9FAFB",
          padding: 24,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "500",
            color: "#6B7280",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          No medicine comparison available for this prescription yet.
        </Text>
        <Touchable
          onPress={() => refetch()}
          style={{
            backgroundColor: "#0F7635",
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 32,
          }}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
            Refresh
          </Text>
        </Touchable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScreenHeader title="Medicine Comparison" showBorder />

      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: "#F9FAFB" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: exactScale(24) }}
        stickyHeaderIndices={totalSavings > 0 ? [2] : [1]}
        // A fast fling to the top triggers Android's stretch overscroll, which
        // pulls the banner away from the header and shows this ScrollView's grey
        // background as a gap. Slow scrolls never overscroll, hence the
        // fast-only symptom.
        overScrollMode="never"
        bounces={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        {/* Savings banner */}
        {totalSavings > 0 && <SavingsBanner amount={totalSavings} />}

        {/* Delivery bar */}
        <CartDeliveringTo
          label={deliveryLabel}
          description={deliveryDescription}
          onChange={() => setShowLocationSheet(true)}
          flat
        />
        <AnimatedComparisonHeader
          scrollYShared={scrollYShared}
          medicinesSectionLayout={medicinesSectionLayout}
        />
        {/* Comparison cards */}
        <View
          onLayout={(e) => {
            const { y, height } = e.nativeEvent.layout;
            setMedicinesSectionLayout({ y, height });
          }}
          style={{ padding: 16, paddingBottom: 0 }}
        >
          {mergedMedicines.map((item) => (
            <View key={item.id} style={{ marginBottom: 16 }}>
              <ComparisonCard
                item={item}
                cardWidth={cardWidth}
                count={item.quantity || 1}
              />
            </View>
          ))}
        </View>

        {/* Refill Reminder — hidden without a prescription id (nothing to persist) */}
        {resolvedPrescriptionId && (
          <RefillReminder
            value={refill.isActive}
            reminderDate={refill.nextRemindDate}
            onToggle={(v) => {
              if (v) setShowReminderSheet(true);
              else refill.cancelReminder();
            }}
          />
        )}

        {/* Coupons */}
        <CartCouponSection
          appliedCoupon={appliedCoupon}
          onRemove={removeCoupon}
          subtotal={subtotal}
        />

        {/* Wallet */}
        {walletBalance > 0 && (
          <CartWalletSection
            value={walletOn}
            walletBalance={walletBalance}
            onToggle={handleWalletToggle}
            hasRemainingAmount={walletHasRemainingAmount}
            discountApplied={WALLET_DISCOUNT}
          />
        )}

        {/* Corporate Credits */}
        {corporateCreditsBalance > 0 && (
          <CartCorporateCreditsSection
            value={corporateCreditsOn}
            balance={corporateCreditsBalance}
            onToggle={(v) => {
              setCorporateCreditsOn(v);
              if (v) playConfetti();
            }}
            eligible={corporateCreditsEligible}
            remainingForEligibility={corporateCreditsRemainingForEligibility}
            hasRemainingAmount={corporateCreditsHasRemainingAmount}
            discountApplied={CORPORATE_CREDITS_DISCOUNT}
          />
        )}

        {/* Coins */}
        <CartCoinsSection
          value={coinsOn}
          availableCoins={availableCoins}
          redeemedCoins={coinsOn ? Math.floor(maxCoinsUsable) : 0}
          onToggle={handleCoinsToggle}
          onInfoPress={() => setShowCoinsSheet(true)}
          hasRemainingAmount={coinsHasRemainingAmount}
        />

        {/* Total Bill */}
        <CartBillSummary
          mrpTotal={mrpTotal}
          toPay={toPay}
          onPress={() => setShowBillDetails(true)}
        />

        {/* Savings Breakdown */}
        {totalSavings > 0 && (
          <CartSavingsBreakdown
            totalSavings={totalSavings}
            rows={savingsRows}
          />
        )}

        {/* Terms */}
        <CartTerms />
      </Animated.ScrollView>

      {/* Footer */}
      <CartFooter
        toPay={toPay}
        safeAreaBottom={adjustedBottom}
        onProceed={handleProceed}
        canProceed={chargesReady}
      />

      {/* Sheets & Modals */}
      <BillDetailsSheet
        isVisible={showBillDetails}
        onClose={() => setShowBillDetails(false)}
        linesCount={mergedMedicines.length}
        mrpTotal={mrpTotal}
        productSavings={productSavings}
        couponDiscount={COUPON_DISCOUNT}
        walletDiscount={WALLET_DISCOUNT}
        coinsDiscount={COINS_DISCOUNT}
        corporateCreditsDiscount={CORPORATE_CREDITS_DISCOUNT}
        deliveryFee={deliveryFee}
        handlingCharge={handlingCharge}
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
      />

      <ReminderSheet
        isVisible={showReminderSheet}
        onClose={() => setShowReminderSheet(false)}
        onConfirm={(input) => refill.setReminder(input)}
      />

      <CartConfetti trigger={confettiTrigger} />
    </View>
  );
};
