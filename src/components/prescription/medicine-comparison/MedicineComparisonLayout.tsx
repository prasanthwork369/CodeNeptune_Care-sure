import { BillDetailsSheet } from "@/src/components/cart/BillDetailsSheet";
import { CareSureCoinsSheet } from "@/src/components/cart/CareSureCoinsSheet";
import { CartBillSummary } from "@/src/components/cart/sections/CartBillSummary";
import { CartCoinsSection } from "@/src/components/cart/sections/CartCoinsSection";
import { CartConfetti } from "@/src/components/cart/sections/CartConfetti";
import { CartCouponSection } from "@/src/components/cart/sections/CartCouponSection";
import { CartDeliveringTo } from "@/src/components/cart/sections/CartDeliveringTo";
import { CartFooter } from "@/src/components/cart/sections/CartFooter";
import { CartSavingsBreakdown } from "@/src/components/cart/sections/CartSavingsBreakdown";
import { CartTerms } from "@/src/components/cart/sections/CartTerms";
import { CartWalletSection } from "@/src/components/cart/sections/CartWalletSection";
import { LocationBottomSheet } from "@/src/components/home/sections/LocationBottomSheet";
import { ReminderSheet } from "@/src/components/prescription/ReminderSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { useNav } from "@/src/hooks/useNav";
import { useCheckoutStore } from "@/src/store/checkoutStore";
import { useCouponStore } from "@/src/store/couponStore";
import { useLocationStore } from "@/src/store/locationStore";
import { usePrescriptionOrderStore } from "@/src/store/prescriptionOrderStore";
import type { Dotlottie } from "@lottiefiles/dotlottie-react-native";
import React, { useMemo, useRef, useState } from "react";
import Animated, { useSharedValue } from "react-native-reanimated";
import {
    ScrollView,
    Text,
    View,
    useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ComparisonCard, AnimatedComparisonHeader, RefillReminder, SavingsBanner } from "./sections";

import { ComparisonMedicine } from "./types";

interface MedicineComparisonLayoutProps {
  medicines: ComparisonMedicine[];
  prescriptionId?: string;
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export const MedicineComparisonLayout: React.FC<
  MedicineComparisonLayoutProps
> = ({ medicines, prescriptionId }) => {
  const router = useNav();
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;

  const setPrescriptionOrderItems = usePrescriptionOrderStore((s) => s.setItems);
  const walletConfettiRef = useRef<Dotlottie>(null);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [walletOn, setWalletOn] = useState(false);
  const [coinsOn, setCoinsOn] = useState(false);
  const [showCoinsSheet, setShowCoinsSheet] = useState(false);
  const [refillOn, setRefillOn] = useState(false);
  const [showReminderSheet, setShowReminderSheet] = useState(false);
  const [medicinesSectionLayout, setMedicinesSectionLayout] = useState({ y: 0, height: 0 });
  const scrollYShared = useSharedValue(0);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollYShared.value = y;
  };

  const handleWalletToggle = (v: boolean) => {
    setWalletOn(v);
    if (v) walletConfettiRef.current?.play();
  };

  const handleCoinsToggle = () => {
    setCoinsOn((v) => {
      const next = !v;
      if (next) walletConfettiRef.current?.play();
      return next;
    });
  };

  // Delivery location
  const storeLocation = useLocationStore((s) => s.location);
  const { addresses } = useAddress();
  const defaultAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const deliveryLabel =
    storeLocation?.label ?? defaultAddress?.label ?? "Address";
  const deliveryDescription =
    storeLocation?.city ??
    [defaultAddress?.line1, defaultAddress?.line2, defaultAddress?.city]
      .filter(Boolean)
      .join(", ") ??
    "No address saved";

  // Wallet & coins
  const { balance } = useWalletBalance();
  const { data: settings } = useCartWalletSettings();
  const walletBalance = balance != null ? Number(balance.walletBalance) : 0;
  const availableCoins = balance?.coinsBalance ?? 0;
  const coinValue = settings?.wallet?.coinValueInRupees ?? 1;
  const coinLimitPct = settings?.wallet?.coinUsagePercentage ?? 10;

  // Coupon
  const { applied: appliedCoupon, remove: removeCoupon } = useCouponStore();

  // Merge duplicate entries for the same recommended medicine, summing quantities
  const mergedMedicines = useMemo(() => {
    const map = new Map<string, ComparisonMedicine>();
    for (const med of medicines ?? []) {
      const key = med.recommended.id;
      const existing = map.get(key);
      if (existing) {
        map.set(key, { ...existing, quantity: (existing.quantity || 1) + (med.quantity || 1) });
      } else {
        map.set(key, { ...med });
      }
    }
    return Array.from(map.values());
  }, [medicines]);

  // Pricing — qty based on recommended medicine quantity
  const subtotal = mergedMedicines.reduce(
    (sum, item) => sum + (item.recommended.price * (item.quantity || 1)),
    0,
  );
  const mrpTotal = mergedMedicines.reduce(
    (sum, item) => sum + (item.recommended.mrp * (item.quantity || 1)),
    0,
  );
  const productSavings = Math.max(0, mrpTotal - subtotal);
  const COUPON_DISCOUNT = appliedCoupon
    ? Math.min(Number(appliedCoupon.discount) || 0, subtotal)
    : 0;
  const maxCoinsUsable = Math.min(
    availableCoins,
    (subtotal * (coinLimitPct / 100)) / coinValue,
  );
  const COINS_DISCOUNT = coinsOn
    ? Math.round(Math.floor(maxCoinsUsable) * coinValue * 10) / 10
    : 0;
  const subtotalBeforeWallet = Math.max(
    subtotal - COUPON_DISCOUNT - COINS_DISCOUNT,
    0,
  );
  const WALLET_DISCOUNT = walletOn
    ? Math.round(Math.min(walletBalance, subtotalBeforeWallet) * 10) / 10
    : 0;
  const toPay = Math.max(subtotalBeforeWallet - WALLET_DISCOUNT, 0);

  const savingsRows = [
    { label: "Product Discount", value: productSavings },
    { label: "Coupon Discount", value: COUPON_DISCOUNT },
    { label: "CareSure Wallet", value: WALLET_DISCOUNT },
    { label: "CareSure Coins", value: COINS_DISCOUNT },
  ];
  const totalSavings = savingsRows.reduce((sum, r) => sum + r.value, 0);

  const handleProceed = () => {
    setPrescriptionOrderItems(
      mergedMedicines.map((item) => ({
        medicineId: item.recommended.id,
        medicineName: item.recommended.name,
        medicineSlug: item.recommended.slug,
        unitPrice: item.recommended.price,
        mrp: item.recommended.mrp,
        discountPercent: item.recommended.discountPercent,
        quantity: item.quantity || 1,
        image: typeof item.recommended.image === "string" ? item.recommended.image : null,
        productId: item.recommended.productId ?? null,
      }))
    );
    useCheckoutStore.getState().setBill(
      {
        subtotal,
        productDiscount: productSavings,
        couponDiscount: COUPON_DISCOUNT,
        walletDiscount: WALLET_DISCOUNT,
        coinsDiscount: COINS_DISCOUNT,
        deliveryFee: 0,
        handlingCharge: 0,
        totalSaved: totalSavings,
        toPay,
      },
      {
        walletUsed: walletOn,
        coinsUsed: coinsOn,
        couponCode: appliedCoupon?.code ?? "",
      }
    );
    router.push({
      pathname: "/(prescription)/select-patient",
      params: {
        toPay: toPay.toFixed(2),
        prescriptionId: prescriptionId ?? "",
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <CartConfetti ref={walletConfettiRef} />

      <ScreenHeader
        title="Medicine Comparison"
        showBorder
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: "#F9FAFB" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom + 100 }}
        stickyHeaderIndices={totalSavings > 0 ? [2] : [1]}
        scrollEventThrottle={16}
        onScroll={handleScroll}
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

        {/* Refill Reminder */}
        <RefillReminder
          value={refillOn}
          onToggle={(v) => {
            if (v) {
              setShowReminderSheet(true);
            } else {
              setRefillOn(false);
            }
          }}
        />

        {/* Coupons */}
        <CartCouponSection
          appliedCoupon={appliedCoupon}
          onRemove={removeCoupon}
          subtotal={subtotal}
        />

        {/* Wallet */}
        <CartWalletSection
          value={walletOn}
          walletBalance={walletBalance}
          onToggle={handleWalletToggle}
        />

        {/* Coins */}
        <CartCoinsSection
          value={coinsOn}
          availableCoins={availableCoins}
          redeemedCoins={coinsOn ? Math.floor(maxCoinsUsable) : 0}
          onToggle={handleCoinsToggle}
          onInfoPress={() => setShowCoinsSheet(true)}
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
      </ScrollView>

      {/* Footer */}
      <CartFooter
        toPay={toPay}
        safeAreaBottom={bottom}
        onProceed={handleProceed}
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
        deliveryFee={0}
        handlingCharge={0}
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
        onConfirm={() => setRefillOn(true)}
      />
    </View>
  );
};
