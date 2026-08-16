import { useCheckoutStore } from "@/src/store/checkoutStore";

describe("useCheckoutStore — Checkout Bill State Management", () => {
  beforeEach(() => {
    useCheckoutStore.getState().clear();
  });

  it("initializes with empty bill, empty cart snapshot, and false discount usage flags", () => {
    const state = useCheckoutStore.getState();
    expect(state.bill).toBeNull();
    expect(state.cartSnapshot).toEqual([]);
    expect(state.walletUsed).toBe(false);
    expect(state.coinsUsed).toBe(false);
    expect(state.corporateCreditsUsed).toBe(false);
    expect(state.couponCode).toBe("");
  });

  it("sets bill breakdown, cart snapshot, and discount metadata flags", () => {
    const mockBill = {
      subtotal: 500,
      productDiscount: 50,
      couponDiscount: 30,
      walletDiscount: 20,
      coinsDiscount: 10,
      corporateCreditsDiscount: 0,
      deliveryFee: 40,
      handlingCharge: 5,
      totalSaved: 110,
      toPay: 435,
    };
    const mockSnapshot = [
      {
        medicineId: "med-1",
        productId: null,
        variantId: null,
        quantity: 2,
        unitPrice: 250,
        discountPercent: 0,
        requiresPrescription: false,
      },
    ];

    useCheckoutStore.getState().setBill(
      mockBill,
      {
        walletUsed: true,
        coinsUsed: true,
        corporateCreditsUsed: false,
        couponCode: "SAVE30",
      },
      mockSnapshot,
    );

    const state = useCheckoutStore.getState();
    expect(state.bill).toEqual(mockBill);
    expect(state.cartSnapshot).toEqual(mockSnapshot);
    expect(state.walletUsed).toBe(true);
    expect(state.coinsUsed).toBe(true);
    expect(state.corporateCreditsUsed).toBe(false);
    expect(state.couponCode).toBe("SAVE30");
  });

  it("clears bill state and cart snapshot completely", () => {
    useCheckoutStore.getState().setBill(
      {
        subtotal: 100,
        productDiscount: 0,
        couponDiscount: 0,
        walletDiscount: 0,
        coinsDiscount: 0,
        corporateCreditsDiscount: 0,
        deliveryFee: 0,
        handlingCharge: 0,
        totalSaved: 0,
        toPay: 100,
      },
      {
        walletUsed: false,
        coinsUsed: false,
        corporateCreditsUsed: false,
        couponCode: "",
      },
      [
        {
          medicineId: "med-1",
          productId: null,
          variantId: null,
          quantity: 1,
          unitPrice: 100,
          discountPercent: 0,
          requiresPrescription: false,
        },
      ],
    );

    useCheckoutStore.getState().clear();

    const state = useCheckoutStore.getState();
    expect(state.bill).toBeNull();
    expect(state.cartSnapshot).toEqual([]);
    expect(state.couponCode).toBe("");
  });
});
