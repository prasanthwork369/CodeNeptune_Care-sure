import { useBillingCalculations } from "@/src/hooks/useBillingCalculations";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";

jest.mock("@/src/hooks/queries/useProfile", () => ({
  useProfile: jest.fn(),
}));

jest.mock("@/src/hooks/queries/useWallet", () => ({
  useWalletBalance: jest.fn(),
}));

jest.mock("@/src/hooks/queries/useSettings", () => ({
  useCartWalletSettings: jest.fn(),
}));

// Selector-aware: the hook reads useCouponStore((s) => s.applied), so the mock
// must apply the selector rather than return the whole state object.
jest.mock("@/src/store/couponStore", () => ({
  useCouponStore: jest.fn((selector?: (s: { applied: null }) => unknown) => {
    const state = { applied: null };
    return selector ? selector(state) : state;
  }),
}));

describe("useBillingCalculations — Billing & Discount Engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useProfile as jest.Mock).mockReturnValue({
      profile: { isCorporateUser: false },
    });
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: { walletBalance: 100, coinsBalance: 50, corporateCredits: 0 },
    });
    (useCartWalletSettings as jest.Mock).mockReturnValue({
      data: { wallet: { coinValueInRupees: 1, coinUsagePercentage: 10 } },
    });
  });

  it("calculates basic product savings when MRP exceeds subtotal", () => {
    const result = useBillingCalculations({
      subtotal: 400,
      mrpTotal: 500,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: false,
    });

    expect(result.productSavings).toBe(100);
    expect(result.toPay).toBe(400);
    expect(result.WALLET_DISCOUNT).toBe(0);
    expect(result.COINS_DISCOUNT).toBe(0);
  });

  it("applies coupon discount capped to subtotal", () => {
    const result = useBillingCalculations({
      subtotal: 150,
      mrpTotal: 200,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: false,
      couponDiscount: 50,
    });

    expect(result.COUPON_DISCOUNT).toBe(50);
    expect(result.toPay).toBe(100);
  });

  it("limits CareSure Coins discount to max percentage of subtotal in rupees", () => {
    // subtotal = 200, coinUsagePercentage = 10% -> max 20 coins allowed even if user has 50
    const result = useBillingCalculations({
      subtotal: 200,
      mrpTotal: 200,
      walletOn: false,
      coinsOn: true,
      corporateCreditsOn: false,
    });

    expect(result.maxCoinsUsable).toBe(20);
    expect(result.COINS_DISCOUNT).toBe(20);
    expect(result.toPay).toBe(180);
  });

  it("deducts CareSure Wallet balance after coupon and coins discounts", () => {
    const result = useBillingCalculations({
      subtotal: 200,
      mrpTotal: 200,
      walletOn: true,
      coinsOn: true,
      corporateCreditsOn: false,
      couponDiscount: 50, // subtotal after coupon = 150
      deliveryFee: 20, // + delivery = 170
    });

    // Coins: 10% of 200 = 20 -> remaining = 150
    // Wallet balance = 100 -> WALLET_DISCOUNT = 100
    expect(result.COUPON_DISCOUNT).toBe(50);
    expect(result.COINS_DISCOUNT).toBe(20);
    expect(result.WALLET_DISCOUNT).toBe(100);
    expect(result.toPay).toBe(50); // (200 - 50 - 20 + 20) - 100 = 50
  });

  it("applies Corporate Credits when user is corporate and order satisfies min order value", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: { isCorporateUser: true },
    });
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: {
        walletBalance: 0,
        coinsBalance: 0,
        corporateCredits: 300,
        minOrderValueForDiscount: 500,
        maxDiscountPerOrder: 200,
      },
    });

    const result = useBillingCalculations({
      subtotal: 600,
      mrpTotal: 600,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: true,
    });

    expect(result.corporateCreditsEligible).toBe(true);
    // Capped by maxDiscountPerOrder (200)
    expect(result.CORPORATE_CREDITS_DISCOUNT).toBe(200);
    expect(result.toPay).toBe(400);
  });

  it("spends corporate credits before the customer's wallet (credits-first waterfall)", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: { isCorporateUser: true },
    });
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: {
        walletBalance: 100,
        coinsBalance: 0,
        corporateCredits: 300,
        minOrderValueForDiscount: 0,
      },
    });

    const result = useBillingCalculations({
      subtotal: 250,
      mrpTotal: 250,
      walletOn: true,
      coinsOn: false,
      corporateCreditsOn: true,
    });

    // Credits cover the full ₹250 first, leaving nothing for the wallet to apply.
    expect(result.CORPORATE_CREDITS_DISCOUNT).toBe(250);
    expect(result.WALLET_DISCOUNT).toBe(0);
    expect(result.toPay).toBe(0);
  });

  it("disallows Corporate Credits when order subtotal is below minimum threshold", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: { isCorporateUser: true },
    });
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: {
        walletBalance: 0,
        coinsBalance: 0,
        corporateCredits: 300,
        minOrderValueForDiscount: 500,
      },
    });

    const result = useBillingCalculations({
      subtotal: 400,
      mrpTotal: 400,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: true,
    });

    expect(result.corporateCreditsEligible).toBe(false);
    expect(result.CORPORATE_CREDITS_DISCOUNT).toBe(0);
    expect(result.corporateCreditsRemainingForEligibility).toBe(100);
    expect(result.toPay).toBe(400);
  });

  it("treats a zero Corporate Credits per-order cap as no cap, matching web", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: { isCorporateUser: true },
    });
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: {
        walletBalance: 0,
        coinsBalance: 0,
        corporateCredits: 1000,
        minOrderValueForDiscount: 0,
        maxDiscountPerOrder: 0,
      },
    });

    const result = useBillingCalculations({
      subtotal: 600,
      mrpTotal: 600,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: true,
    });

    expect(result.corporateCreditsEligible).toBe(true);
    expect(result.CORPORATE_CREDITS_DISCOUNT).toBe(600);
    expect(result.toPay).toBe(0);
  });

  it("uses the payable subtotal including charges for Corporate Credits eligibility", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: { isCorporateUser: true },
    });
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: {
        walletBalance: 0,
        coinsBalance: 0,
        corporateCredits: 1000,
        minOrderValueForDiscount: 500,
        maxDiscountPerOrder: 0,
      },
    });

    const result = useBillingCalculations({
      subtotal: 450,
      mrpTotal: 450,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: true,
      deliveryFee: 50,
    });

    expect(result.corporateCreditsEligible).toBe(true);
    expect(result.CORPORATE_CREDITS_DISCOUNT).toBe(500);
    expect(result.toPay).toBe(0);
  });

  it("keeps paise exact: ₹130.31 + ₹50 delivery = ₹180.31 (not ₹180.30)", () => {
    // Regression: the old Math.round(x*10)/10 rounded to 10 paise and dropped
    // the ₹0.01, showing ₹180.30. Must stay paise-accurate.
    const result = useBillingCalculations({
      subtotal: 130.31,
      mrpTotal: 130.31,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: false,
      deliveryFee: 50,
    });

    expect(result.toPay).toBe(180.31);
  });

  it("never returns negative toPay value", () => {
    const result = useBillingCalculations({
      subtotal: 50,
      mrpTotal: 50,
      walletOn: true,
      coinsOn: false,
      corporateCreditsOn: false,
      couponDiscount: 100, // coupon > subtotal
    });

    expect(result.toPay).toBe(0);
  });

  it("sets walletHasRemainingAmount to false when Corporate Credits covers 100% of payable", () => {
    (useProfile as jest.Mock).mockReturnValue({
      profile: { isCorporateUser: true },
    });
    (useWalletBalance as jest.Mock).mockReturnValue({
      balance: {
        walletBalance: 200,
        coinsBalance: 50,
        corporateCredits: 500,
        minOrderValueForDiscount: 0,
        maxDiscountPerOrder: 0,
      },
    });

    // 1. Corporate ON covers entire ₹300 subtotal -> toPay is 0, walletHasRemainingAmount is false
    const corporateOnResult = useBillingCalculations({
      subtotal: 300,
      mrpTotal: 300,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: true,
    });

    expect(corporateOnResult.CORPORATE_CREDITS_DISCOUNT).toBe(300);
    expect(corporateOnResult.toPay).toBe(0);
    expect(corporateOnResult.walletHasRemainingAmount).toBe(false);
    expect(corporateOnResult.coinsHasRemainingAmount).toBe(false);

    // 2. Corporate toggled OFF -> walletHasRemainingAmount immediately recovers to true
    const corporateOffResult = useBillingCalculations({
      subtotal: 300,
      mrpTotal: 300,
      walletOn: false,
      coinsOn: false,
      corporateCreditsOn: false,
    });

    expect(corporateOffResult.CORPORATE_CREDITS_DISCOUNT).toBe(0);
    expect(corporateOffResult.toPay).toBe(300);
    expect(corporateOffResult.walletHasRemainingAmount).toBe(true);
    expect(corporateOffResult.coinsHasRemainingAmount).toBe(true);
  });
});
