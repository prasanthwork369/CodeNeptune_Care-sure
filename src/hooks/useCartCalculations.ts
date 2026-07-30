import { useCart } from "@/src/hooks/queries/useCart";
import { useCoupons } from "@/src/hooks/queries/useCoupons";
import { useFeaturedMedicines } from "@/src/hooks/queries/useFeaturedMedicines";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useDeliveryCharges } from "@/src/hooks/useDeliveryCharges";
import { useBillingCalculations } from "@/src/hooks/useBillingCalculations";
import { useDeliveryAddress } from "@/src/hooks/useDeliveryAddress";
import { useNav } from "@/src/hooks/useNav";
import { COUPON_DISCOUNT_TYPE } from "@/src/constants/coupon";
import { useAuthStore } from "@/src/store/authStore";
import { useCheckoutStore } from "@/src/store/checkoutStore";
import { useCouponStore } from "@/src/store/couponStore";
import { useLocationStore } from "@/src/store/locationStore";
import { analyticsService } from "@/src/services/firebase";
import { CartLine } from "@/src/types/cart";
import { Product } from "@/src/types/home";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useCartCalculations() {
  const router = useNav();

  const [walletOn, setWalletOn] = useState(false);
  const [coinsOn, setCoinsOn] = useState(false);
  const [corporateCreditsOn, setCorporateCreditsOn] = useState(false);

  // Confetti trigger: incrementing this counter causes CartConfetti to remount
  // with a fresh DotLottie instance (autoplay=true), which is the only reliable
  // way to replay a loop=false animation on both iOS and Android. Using
  // ref.play() after the animation has already finished is a no-op on Android.
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const confettiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playConfetti = useCallback((delayMs = 0) => {
    if (confettiTimer.current) clearTimeout(confettiTimer.current);
    if (delayMs > 0) {
      confettiTimer.current = setTimeout(() => {
        setConfettiTrigger((n) => n + 1);
        confettiTimer.current = null;
      }, delayMs);
    } else {
      setConfettiTrigger((n) => n + 1);
    }
  }, []);

  // Or a pending 350ms confetti timer fires after the user has left the cart.
  useEffect(
    () => () => {
      if (confettiTimer.current) clearTimeout(confettiTimer.current);
    },
    [],
  );

  const handleWalletToggle = (v: boolean) => {
    setWalletOn(v);
    if (v) playConfetti();
  };

  const handleCorporateCreditsToggle = (v: boolean) => {
    setCorporateCreditsOn(v);
    if (v) playConfetti();
  };

  const handleCoinsToggle = () => {
    setCoinsOn((v) => {
      const next = !v;
      if (next) playConfetti();
      return next;
    });
  };

  // Field selectors, or the whole cart re-renders on any write to these stores.
  const appliedCoupon = useCouponStore((s) => s.applied);
  const removeCoupon = useCouponStore((s) => s.remove);
  const justApplied = useCouponStore((s) => s.justApplied);
  const clearJustApplied = useCouponStore((s) => s.clearJustApplied);
  const { data: coupons = [] } = useCoupons();
  const setBill = useCheckoutStore((s) => s.setBill);
  const { profile } = useProfile();
  const firstName = profile?.firstName ?? "You";
  const reopenLocationSheet = useLocationStore((s) => s.reopenLocationSheet);
  const setReopenLocationSheet = useLocationStore(
    (s) => s.setReopenLocationSheet,
  );
  // Same resolved address the sheet highlights and checkout ships to. The old
  // local `selectedLocation` copy is gone: the sheet writes the pick to the
  // store, so a second copy here could only drift out of sync with it.
  const { address: defaultAddress, displayLocation: deliveryLocation } =
    useDeliveryAddress();

  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showCoinsSheet, setShowCoinsSheet] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (reopenLocationSheet) {
        setShowLocationSheet(true);
        setReopenLocationSheet(false);
      }
      if (justApplied) {
        // Delay by 350ms to let the screen pop transition finish first,
        // then bump trigger so CartConfetti remounts with autoplay=true.
        playConfetti(350);
        clearJustApplied();
      }
    }, [
      reopenLocationSheet,
      justApplied,
      setReopenLocationSheet,
      clearJustApplied,
      playConfetti,
    ]),
  );

  const {
    items: cartItems,
    totalPrice: cartTotalPrice,
    addItem,
    removeItem: removeCartItem,
    updateItem: updateCartItem,
    isLoading: isCartLoading,
  } = useCart();
  const removeCartItemRef = useRef(removeCartItem);
  const updateCartItemRef = useRef(updateCartItem);
  removeCartItemRef.current = removeCartItem;
  updateCartItemRef.current = updateCartItem;

  const removeItem = useCallback(
    (itemId: string) => removeCartItemRef.current(itemId),
    [],
  );
  const updateItem = useCallback(
    (itemId: string, input: { quantity: number }) =>
      updateCartItemRef.current(itemId, input),
    [],
  );
  const { products: featuredProducts } = useFeaturedMedicines();

  // Memoized, or a fresh identity re-renders the whole item list every time.
  const lines: CartLine[] = useMemo(
    () =>
      cartItems.map((item): CartLine => {
        // unitPrice from the backend is the MRP (strikethrough price); the
        // payable selling price is derived by applying discountPercent to it —
        // matches customer-website's cart-utils.ts (rawMrp * (1 - discount/100)).
        const mrp = parseFloat(String(item.unitPrice));
        const discountPct = parseFloat(
          String(item.discountPercent ?? item.metadata?.discountPercent ?? 0),
        );
        const price =
          discountPct > 0
            ? parseFloat((mrp * (1 - discountPct / 100)).toFixed(2))
            : mrp;
        const imageUri = item.image ?? item.metadata?.image;
        const packSize = item.metadata?.packSize ?? item.packSize;
        const productId =
          item.productId ?? item.metadata?.productId ?? item.medicineId;
        return {
          id: item.id,
          productId,
          productIdResolved: !!(item.productId ?? item.metadata?.productId),
          medicineId: item.medicineId,
          name: item.medicineName,
          brand: item.metadata?.brand ?? "",
          // Prefer the backend's human-readable packaging string; fall back to raw packSize.
          pack: item.packagingDetail ?? packSize ?? "",
          discount:
            discountPct > 0 ? `${parseFloat(discountPct.toFixed(2))}% off` : "",
          mrp,
          price,
          qty: item.quantity,
          image: imageUri ? { uri: imageUri } : null,
          rx: item.requiresPrescription,
        };
      }),
    [cartItems],
  );

  const subtotal = cartTotalPrice;
  const mrpTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.mrp * l.qty, 0),
    [lines],
  );
  const productSavings = Math.max(0, mrpTotal - subtotal);

  const {
    isReady: chargesReady,
    deliveryFee: DELIVERY_FEE,
    handlingCharge: HANDLING_CHARGE,
    remainingForFreeDelivery,
    freeDeliveryProgress,
  } = useDeliveryCharges(subtotal);

  // 1. Coupon — recomputed live from the coupon's own rule (not the frozen
  // apply-time amount), so it tracks quantity changes in either direction.
  const appliedCouponDef = appliedCoupon
    ? coupons.find((c) => c.code === appliedCoupon.code)
    : null;
  const couponStillEligible =
    !appliedCouponDef || subtotal >= appliedCouponDef.minOrderValue;

  useEffect(() => {
    if (appliedCoupon && appliedCouponDef && !couponStillEligible) {
      removeCoupon();
    }
  }, [appliedCoupon, appliedCouponDef, couponStillEligible, removeCoupon]);

  const COUPON_DISCOUNT =
    appliedCoupon && couponStillEligible
      ? Math.min(
          appliedCouponDef
            ? appliedCouponDef.discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE
              ? appliedCouponDef.maxDiscountAmount
                ? Math.min(
                    (subtotal * appliedCouponDef.discountValue) / 100,
                    appliedCouponDef.maxDiscountAmount,
                  )
                : (subtotal * appliedCouponDef.discountValue) / 100
              : appliedCouponDef.discountValue
            : Number(appliedCoupon.discount) || 0,
          subtotal,
        )
      : 0;

  const {
    walletBalance,
    availableCoins,
    maxCoinsUsable,
    coinValue,
    COINS_DISCOUNT,
    WALLET_DISCOUNT,
    CORPORATE_CREDITS_DISCOUNT,
    corporateCreditsBalance,
    corporateCreditsEligible,
    corporateCreditsRemainingForEligibility,
    toPay,
    savingsRows,
    totalSavings,
  } = useBillingCalculations({
    subtotal,
    mrpTotal,
    walletOn,
    coinsOn,
    corporateCreditsOn,
    deliveryFee: DELIVERY_FEE,
    handlingCharge: HANDLING_CHARGE,
    couponDiscount: COUPON_DISCOUNT,
  });

  const coinsUsed = coinsOn ? Math.floor(maxCoinsUsable) : 0;

  const handleAddItem = (product: Product) => {
    const rawImage: unknown = product.image;
    const imageUri =
      typeof rawImage === "string"
        ? rawImage
        : ((rawImage as { uri?: string } | null)?.uri ?? undefined);
    // Send the MRP as unitPrice (backend derives the selling price from
    // unitPrice * (1 - discountPercent/100)) — matches customer-website's
    // ProductCard.tsx (unitPrice: mrp, mrp: mrp, discountPercent).
    const mrp = Number(product.originalPrice ?? product.price ?? 0);
    return addItem({
      medicineId: String(product.id ?? ""),
      variantId: null,
      medicineName: String(product.name ?? ""),
      medicineSlug: String(product.slug ?? product.id ?? ""),
      unitPrice: mrp,
      mrp,
      discountPercent: Number(product.discountPercent ?? 0),
      quantity: 1,
      requiresPrescription: product.requiresPrescription ?? false,
      image: imageUri,
      metadata: { image: imageUri, manufacturer: null },
    });
  };

  const handleProceed = () => {
    // Charges come from admin settings; proceeding before they land would
    // freeze a bill with no delivery or handling fee into the order.
    if (!chargesReady) return;

    // Before setBill, or a guest bounced to login leaves a stale bill behind.
    if (!useAuthStore.getState().isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    setBill(
      {
        subtotal,
        productDiscount: productSavings,
        couponDiscount: COUPON_DISCOUNT,
        walletDiscount: WALLET_DISCOUNT,
        coinsDiscount: COINS_DISCOUNT,
        corporateCreditsDiscount: CORPORATE_CREDITS_DISCOUNT,
        deliveryFee: DELIVERY_FEE,
        handlingCharge: HANDLING_CHARGE,
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
    // All-OTC carts have nothing to collect, so they skip to payment.
    const hasRxItem = lines.some((l) => l.rx);

    void analyticsService.logBeginCheckout(lines.length, toPay);

    // Rx carts must collect a prescription first; all-OTC carts skip to payment.
    if (hasRxItem) {
      router.push({
        pathname: "/(prescription)/choose-method",
        params: { toPay: String(toPay) },
      });
      return;
    }
    router.push({
      pathname: "/(prescription)/payment",
      params: { toPay: String(toPay) },
    });
  };

  return {
    router,
    walletOn,
    coinsOn,
    corporateCreditsOn,
    confettiTrigger,
    handleWalletToggle,
    handleCoinsToggle,
    handleCorporateCreditsToggle,
    setCoinsOn,
    appliedCoupon,
    removeCoupon,
    justApplied,
    clearJustApplied,
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
    chargesReady,
    COUPON_DISCOUNT,
    coinsUsed,
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
  };
}
