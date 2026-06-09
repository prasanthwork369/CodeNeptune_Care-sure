import { useAddress } from "@/src/hooks/queries/useAddress";
import { useCart } from "@/src/hooks/queries/useCart";
import { useFeaturedMedicines } from "@/src/hooks/queries/useFeaturedMedicines";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { useNav } from "@/src/hooks/useNav";
import { useCheckoutStore } from "@/src/store/checkoutStore";
import { useCouponStore } from "@/src/store/couponStore";
import { useLocationStore } from "@/src/store/locationStore";
import { CartLine } from "@/src/types/cart";
import { useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback, useRef, useState } from "react";

export function useCartCalculations() {
  const router = useNav();

  const [walletOn, setWalletOn] = useState(false);
  const [coinsOn, setCoinsOn] = useState(false);
  const walletConfettiRef = useRef<LottieView>(null);

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

  const {
    applied: appliedCoupon,
    remove: removeCoupon,
    justApplied,
    clearJustApplied,
  } = useCouponStore();
  const setBill = useCheckoutStore((s) => s.setBill);
  const { profile } = useProfile();
  const firstName = profile?.firstName ?? "You";
  const {
    location: storeLocation,
    reopenLocationSheet,
    setReopenLocationSheet,
  } = useLocationStore();
  const { addresses } = useAddress();
  const defaultAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const [selectedLocation, setSelectedLocation] = useState<{
    label: string;
    city: string;
  } | null>(null);
  const deliveryLocation = selectedLocation ?? storeLocation;

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
        walletConfettiRef.current?.play();
        clearJustApplied();
      }
    }, [reopenLocationSheet, justApplied]),
  );

  const {
    items: cartItems,
    totalPrice: cartTotalPrice,
    addItem,
    removeItem,
    updateItem,
  } = useCart();
  const { products: featuredProducts } = useFeaturedMedicines();
  const { balance } = useWalletBalance();
  const { data: settings } = useCartWalletSettings();
  const availableCoins = balance?.coinsBalance ?? 0;
  const walletBalance = balance != null ? Number(balance.walletBalance) : 0;

  const lines: CartLine[] = cartItems.map((item): CartLine => {
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
      pack: packSize ?? "",
      discount:
        discountPct > 0 ? `${parseFloat(discountPct.toFixed(2))}% off` : "",
      mrp,
      price,
      qty: item.quantity,
      image: imageUri ? { uri: imageUri } : null,
      rx: item.requiresPrescription,
    };
  });

  const subtotal = cartTotalPrice;
  const mrpTotal = lines.reduce((sum, l) => sum + l.mrp * l.qty, 0);
  const productSavings = Math.max(0, mrpTotal - subtotal);

  const coinValue = settings?.wallet?.coinValueInRupees ?? 1;
  const coinLimitPct = settings?.wallet?.coinUsagePercentage ?? 10;

  const FREE_DELIVERY_THRESHOLD = settings?.cart?.freeDeliveryAbove ?? 500;
  const DELIVERY_FEE =
    subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : (settings?.cart?.standardDeliveryCharge ?? 49);
  const HANDLING_CHARGE = settings?.cart?.handlingCharge ?? 15;

  // 1. Coupon — applied to subtotal
  const COUPON_DISCOUNT = Math.min(
    appliedCoupon ? Number(appliedCoupon.discount) || 0 : 0,
    subtotal,
  );

  // 2. Coins — limit based on subtotal (selling price), applied before wallet
  const maxCoinsUsable = Math.min(
    availableCoins,
    (subtotal * (coinLimitPct / 100)) / coinValue,
  );
  const coinsUsed = coinsOn ? Math.floor(maxCoinsUsable) : 0;
  const COINS_DISCOUNT = Math.round(coinsUsed * coinValue * 10) / 10;

  // 3. Wallet — applied last, covers items + fees after coupon & coins
  const subtotalBeforeWallet = Math.max(
    subtotal -
      COUPON_DISCOUNT -
      COINS_DISCOUNT +
      DELIVERY_FEE +
      HANDLING_CHARGE,
    0,
  );
  const WALLET_DISCOUNT = walletOn
    ? Math.round(Math.min(walletBalance, subtotalBeforeWallet) * 10) / 10
    : 0;

  const toPay =
    Math.round(Math.max(subtotalBeforeWallet - WALLET_DISCOUNT, 0) * 10) / 10;

  const savingsRows = [
    { label: "Product Discount", value: productSavings },
    { label: "Coupon Discount", value: COUPON_DISCOUNT },
    { label: "CareSure Coins", value: COINS_DISCOUNT },
    { label: "CareSure Wallet", value: WALLET_DISCOUNT },
  ];
  const totalSavings = savingsRows.reduce((sum, r) => sum + r.value, 0);
  const remainingForFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - subtotal,
  );
  const freeDeliveryProgress = Math.min(1, subtotal / FREE_DELIVERY_THRESHOLD);

  const handleAddItem = (product: any) => {
    const imageUri =
      product.image?.uri ??
      (typeof product.image === "string" ? product.image : undefined);
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
    setBill(
      {
        subtotal,
        productDiscount: productSavings,
        couponDiscount: COUPON_DISCOUNT,
        walletDiscount: WALLET_DISCOUNT,
        coinsDiscount: COINS_DISCOUNT,
        deliveryFee: DELIVERY_FEE,
        handlingCharge: HANDLING_CHARGE,
        totalSaved: totalSavings,
        toPay,
      },
      {
        walletUsed: walletOn,
        coinsUsed: coinsOn,
        couponCode: appliedCoupon?.code ?? "",
      },
    );
    const hasRxItem = lines.some((l) => l.rx);
    if (hasRxItem) {
      router.push({
        pathname: "/(prescription)/choose-method",
        params: { toPay: String(toPay) },
      });
    } else {
      router.push({
        pathname: "/(prescription)/select-patient",
        params: { toPay: String(toPay) },
      });
    }
  };

  return {
    router,
    walletOn,
    coinsOn,
    walletConfettiRef,
    handleWalletToggle,
    handleCoinsToggle,
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
    COUPON_DISCOUNT,
    coinsUsed,
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
  };
}
