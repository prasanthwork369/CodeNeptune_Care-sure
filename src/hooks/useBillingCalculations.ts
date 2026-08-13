import { useProfile } from "@/src/hooks/queries/useProfile";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useCouponStore } from "@/src/store/couponStore";
import { roundToPaise } from "@/src/utils/money";

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
  // Selector, or any coupon write re-runs this on both cart and payment.
  const appliedCoupon = useCouponStore((s) => s.applied);

  const isCorporateUser = profile?.isCorporateUser ?? false;
  const availableCoins = balance?.coinsBalance ?? 0;
  const walletBalance = balance != null ? Number(balance.walletBalance) : 0;
  const coinValue = settings?.wallet?.coinValueInRupees ?? 1;
  const coinLimitPct = settings?.wallet?.coinUsagePercentage ?? 10;

  // 1. Product savings
  const productSavings = roundToPaise(Math.max(0, mrpTotal - subtotal));

  // 2. Coupon Discount
  const COUPON_DISCOUNT =
    couponDiscount !== undefined
      ? couponDiscount
      : appliedCoupon
        ? Math.min(Number(appliedCoupon.discount) || 0, subtotal)
        : 0;

  // 3. Coins Discount
  const maxCoinsUsable = Math.min(
    availableCoins,
    (subtotal * (coinLimitPct / 100)) / coinValue,
  );
  const COINS_DISCOUNT = coinsOn
    ? roundToPaise(Math.floor(maxCoinsUsable) * coinValue)
    : 0;

  // Amount owed after product discounts + charges; the credits→wallet waterfall applies to this.
  const subtotalBeforeCredits = Math.max(
    subtotal - COUPON_DISCOUNT - COINS_DISCOUNT + deliveryFee + handlingCharge,
    0,
  );

  // 4. Corporate Credits — applied first so company money is spent before the customer's own wallet.
  const corporateCreditsBalance =
    isCorporateUser && balance != null
      ? Number(balance.corporateCredits ?? 0)
      : 0;
  const corporateCreditsMinOrderValue = Number(
    balance?.minOrderValueForDiscount ?? 0,
  );
  const configuredCreditsCap = Number(balance?.maxDiscountPerOrder ?? 0);
  // Web treats zero as "no per-order cap", not as a zero-value discount.
  const corporateCreditsMaxDiscount =
    configuredCreditsCap > 0 ? configuredCreditsCap : corporateCreditsBalance;

  // Match web: eligibility uses the payable subtotal after coupon/coins and
  // includes delivery and handling charges.
  const corporateCreditsEligible =
    corporateCreditsMinOrderValue > 0
      ? subtotalBeforeCredits >= corporateCreditsMinOrderValue
      : true;
  const corporateCreditsRemainingForEligibility = Math.max(
    0,
    roundToPaise(corporateCreditsMinOrderValue - subtotalBeforeCredits),
  );
  // How much would still be owed if Corporate Credits weren't used at all —
  // independent of corporateCreditsOn, since subtotalBeforeCredits already
  // excludes it. If Coins + Wallet alone already cover the bill, there's
  // nothing left for Corporate Credits to offset, so it should be un-toggleable.
  const remainingWithoutCorporateCredits = walletOn
    ? Math.max(subtotalBeforeCredits - walletBalance, 0)
    : subtotalBeforeCredits;
  const corporateCreditsHasRemainingAmount =
    remainingWithoutCorporateCredits > 0;
  const CORPORATE_CREDITS_DISCOUNT =
    corporateCreditsOn && corporateCreditsEligible
      ? roundToPaise(
          Math.min(
            corporateCreditsBalance,
            corporateCreditsMaxDiscount,
            subtotalBeforeCredits,
          ),
        )
      : 0;

  // 5. Wallet — applied to whatever remains after corporate credits.
  const subtotalBeforeWallet = Math.max(
    subtotalBeforeCredits - CORPORATE_CREDITS_DISCOUNT,
    0,
  );
  const WALLET_DISCOUNT = walletOn
    ? roundToPaise(Math.min(walletBalance, subtotalBeforeWallet))
    : 0;
  // Mirrors corporateCreditsHasRemainingAmount: subtotalBeforeWallet already
  // reflects Corporate Credits' current on/off state, so this is exactly
  // "is there anything left for Wallet to pay for".
  const walletHasRemainingAmount = subtotalBeforeWallet > 0;

  // Coins sits first in the waterfall, so simulate the rest of the chain
  // (Corporate Credits, then Wallet, at their current on/off state) against
  // the larger amount left over without Coins. If those alone already cover
  // it, Coins has nothing left to offset either.
  const afterCouponWithoutCoins = Math.max(
    subtotal - COUPON_DISCOUNT + deliveryFee + handlingCharge,
    0,
  );
  const corporateCoverWithoutCoins =
    corporateCreditsOn && corporateCreditsEligible
      ? Math.min(
          corporateCreditsBalance,
          corporateCreditsMaxDiscount,
          afterCouponWithoutCoins,
        )
      : 0;
  const afterCorporateWithoutCoins = Math.max(
    afterCouponWithoutCoins - corporateCoverWithoutCoins,
    0,
  );
  const walletCoverWithoutCoins = walletOn
    ? Math.min(walletBalance, afterCorporateWithoutCoins)
    : 0;
  const coinsHasRemainingAmount =
    afterCorporateWithoutCoins - walletCoverWithoutCoins > 0;

  const toPay = roundToPaise(
    Math.max(subtotalBeforeWallet - WALLET_DISCOUNT, 0),
  );

  // NOT memoized on purpose — this hook stays callable as a plain function so the tests can call it directly.
  const savingsRows = [
    { label: "Product Discount", value: productSavings },
    { label: "Coupon Discount", value: COUPON_DISCOUNT },
    { label: "CareSure Wallet", value: WALLET_DISCOUNT },
    { label: "CareSure Coins", value: COINS_DISCOUNT },
    { label: "Corporate Credits", value: CORPORATE_CREDITS_DISCOUNT },
  ];
  const totalSavings = roundToPaise(
    savingsRows.reduce((sum, r) => sum + r.value, 0),
  );

  return {
    isCorporateUser,
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
  };
};
