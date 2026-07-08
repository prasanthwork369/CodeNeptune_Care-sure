import { useProfile } from "@/src/hooks/queries/useProfile";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useCouponStore } from "@/src/store/couponStore";

interface BillingInput {
  subtotal: number;
  mrpTotal: number;
  walletOn: boolean;
  coinsOn: boolean;
  corporateCreditsOn: boolean;
  deliveryFee?: number;
  handlingCharge?: number;
  couponDiscount?: number;
}

/**
 * Reusable custom hook to calculate order pricing, discounts, and credits usage.
 * Shares identical billing breakdown formulas between Cart and Prescription screens.
 */
export const useBillingCalculations = ({
  subtotal,
  mrpTotal,
  walletOn,
  coinsOn,
  corporateCreditsOn,
  deliveryFee = 0,
  handlingCharge = 0,
  couponDiscount,
}: BillingInput) => {
  const { profile } = useProfile();
  const { balance } = useWalletBalance();
  const { data: settings } = useCartWalletSettings();
  const { applied: appliedCoupon } = useCouponStore();

  const isCorporateUser = profile?.isCorporateUser ?? false;
  const availableCoins = balance?.coinsBalance ?? 0;
  const walletBalance = balance != null ? Number(balance.walletBalance) : 0;
  const coinValue = settings?.wallet?.coinValueInRupees ?? 1;
  const coinLimitPct = settings?.wallet?.coinUsagePercentage ?? 10;

  // 1. Product savings
  const productSavings = Math.max(0, mrpTotal - subtotal);

  // 2. Coupon Discount
  const COUPON_DISCOUNT = couponDiscount !== undefined
    ? couponDiscount
    : (appliedCoupon ? Math.min(Number(appliedCoupon.discount) || 0, subtotal) : 0);

  // 3. Coins Discount
  const maxCoinsUsable = Math.min(
    availableCoins,
    (subtotal * (coinLimitPct / 100)) / coinValue,
  );
  const COINS_DISCOUNT = coinsOn
    ? Math.round(Math.floor(maxCoinsUsable) * coinValue * 10) / 10
    : 0;

  // 4. Wallet Discount
  const subtotalBeforeWallet = Math.max(
    subtotal - COUPON_DISCOUNT - COINS_DISCOUNT + deliveryFee + handlingCharge,
    0,
  );
  const WALLET_DISCOUNT = walletOn
    ? Math.round(Math.min(walletBalance, subtotalBeforeWallet) * 10) / 10
    : 0;

  // 5. Corporate Credits
  const corporateCreditsBalance =
    isCorporateUser && balance != null ? Number(balance.corporateCredits ?? 0) : 0;
  const corporateCreditsMinOrderValue = Number(
    balance?.minOrderValueForDiscount ?? 0,
  );
  const corporateCreditsMaxDiscount =
    balance?.maxDiscountPerOrder != null
      ? Number(balance.maxDiscountPerOrder)
      : Infinity;

  const corporateCreditsEligible = subtotal >= corporateCreditsMinOrderValue;
  const corporateCreditsRemainingForEligibility = Math.max(
    0,
    Math.round((corporateCreditsMinOrderValue - subtotal) * 10) / 10,
  );
  const subtotalBeforeCorporateCredits = Math.max(
    subtotalBeforeWallet - WALLET_DISCOUNT,
    0,
  );
  const CORPORATE_CREDITS_DISCOUNT =
    corporateCreditsOn && corporateCreditsEligible
      ? Math.round(
          Math.min(
            corporateCreditsBalance,
            corporateCreditsMaxDiscount,
            subtotalBeforeCorporateCredits,
          ) * 10,
        ) / 10
      : 0;

  const toPay = Math.round(
    Math.max(
      subtotalBeforeCorporateCredits - CORPORATE_CREDITS_DISCOUNT,
      0,
    ) * 10,
  ) / 10;

  const savingsRows = [
    { label: "Product Discount", value: productSavings },
    { label: "Coupon Discount", value: COUPON_DISCOUNT },
    { label: "CareSure Wallet", value: WALLET_DISCOUNT },
    { label: "CareSure Coins", value: COINS_DISCOUNT },
    { label: "Corporate Credits", value: CORPORATE_CREDITS_DISCOUNT },
  ];
  const totalSavings = savingsRows.reduce((sum, r) => sum + r.value, 0);

  return {
    isCorporateUser,
    walletBalance,
    availableCoins,
    maxCoinsUsable,
    coinValue,
    COUPON_DISCOUNT,
    COINS_DISCOUNT,
    WALLET_DISCOUNT,
    CORPORATE_CREDITS_DISCOUNT,
    corporateCreditsBalance,
    corporateCreditsEligible,
    corporateCreditsRemainingForEligibility,
    productSavings,
    toPay,
    savingsRows,
    totalSavings,
  };
};
