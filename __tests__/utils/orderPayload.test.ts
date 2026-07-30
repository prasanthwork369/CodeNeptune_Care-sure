import {
  buildCartOrderItems,
  buildOrderPayload,
  buildPrescriptionOrderItems,
  computeItemsSubtotal,
  OrderBillBreakdown,
  sumOrderDiscounts,
} from "@/src/utils/orderPayload";

const bill = (over: Partial<OrderBillBreakdown> = {}): OrderBillBreakdown => ({
  itemTotal: 1000,
  productDiscount: 0,
  couponDiscount: 0,
  walletDiscount: 0,
  coinsDiscount: 0,
  creditsDiscount: 0,
  deliveryFee: 0,
  handlingCharge: 0,
  totalSaved: 0,
  toPay: 1000,
  ...over,
});

const address = {
  name: "Asha",
  phone: "9999999999",
  line1: "12 MG Road",
  city: "Bengaluru",
  state: "KA",
  pincode: "560001",
};

describe("buildCartOrderItems", () => {
  it("stringifies unit price and keeps the snapshot", () => {
    const items = buildCartOrderItems([
      {
        medicineId: "m1",
        quantity: 2,
        unitPrice: 49.5,
        medicineName: "Paracetamol",
        medicineSlug: "paracetamol",
        productId: "CS-1",
        image: "https://img/1.png",
        requiresPrescription: false,
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].unitPrice).toBe("49.5");
    expect(items[0].quantity).toBe(2);
    expect(items[0].medicineSnapshot.name).toBe("Paracetamol");
    expect(items[0].medicineSnapshot.requiresPrescription).toBe(false);
  });

  // The backend does not always promote these out of metadata.
  it("falls back to metadata for productId, image and mrp", () => {
    const items = buildCartOrderItems([
      {
        medicineId: "m1",
        quantity: 1,
        unitPrice: "10",
        medicineName: "X",
        productId: null,
        image: null,
        metadata: {
          productId: "CS-META",
          image: "https://img/meta.png",
          mrp: 25,
          brand: "Acme",
          pack: "10 tablets",
        },
      },
    ]);

    expect(items[0].medicineSnapshot.productId).toBe("CS-META");
    expect(items[0].medicineSnapshot.image).toBe("https://img/meta.png");
    expect(items[0].medicineSnapshot.mrp).toBe(25);
    expect(items[0].medicineSnapshot.brand).toBe("Acme");
    expect(items[0].medicineSnapshot.pack).toBe("10 tablets");
  });

  it("prefers the top-level value over metadata", () => {
    const items = buildCartOrderItems([
      {
        medicineId: "m1",
        quantity: 1,
        unitPrice: "10",
        medicineName: "X",
        productId: "CS-TOP",
        metadata: { productId: "CS-META" },
      },
    ]);

    expect(items[0].medicineSnapshot.productId).toBe("CS-TOP");
  });
});

describe("buildPrescriptionOrderItems", () => {
  it("always marks lines as prescription-required", () => {
    const items = buildPrescriptionOrderItems([
      {
        medicineId: "m9",
        quantity: 3,
        unitPrice: 120,
        medicineName: "Amoxicillin",
        mrp: 150,
      },
    ]);

    expect(items[0].unitPrice).toBe("120");
    expect(items[0].medicineSnapshot.requiresPrescription).toBe(true);
    expect(items[0].medicineSnapshot.mrp).toBe(150);
  });
});

describe("computeItemsSubtotal / sumOrderDiscounts", () => {
  it("multiplies price by quantity across lines", () => {
    const items = buildCartOrderItems([
      { medicineId: "a", quantity: 2, unitPrice: "50", medicineName: "A" },
      { medicineId: "b", quantity: 3, unitPrice: "10.5", medicineName: "B" },
    ]);

    expect(computeItemsSubtotal(items)).toBeCloseTo(131.5, 2);
  });

  it("adds every discount channel", () => {
    expect(
      sumOrderDiscounts(
        bill({
          productDiscount: 10,
          couponDiscount: 20,
          walletDiscount: 5,
          coinsDiscount: 2.5,
          creditsDiscount: 1,
        }),
      ),
    ).toBeCloseTo(38.5, 2);
  });
});

describe("buildOrderPayload", () => {
  const items = buildCartOrderItems([
    { medicineId: "a", quantity: 2, unitPrice: "50", medicineName: "A" },
  ]);

  const base = {
    items,
    address,
    bill: bill({ toPay: 88.5, deliveryFee: 15, couponDiscount: 11.5 }),
    idempotencyKey: "idem-123",
    walletUsed: false,
    coinsUsed: false,
    creditsUsed: false,
  };

  // The total must come from the calculated bill, never a spoofable route param.
  it("sends the calculated total, formatted to two decimals", () => {
    expect(buildOrderPayload(base).total).toBe("88.50");
  });

  it("uses the server subtotal when present", () => {
    expect(buildOrderPayload({ ...base, subtotal: 250 }).subtotal).toBe(
      "250.00",
    );
  });

  it("falls back to the sum of the lines when no server subtotal", () => {
    expect(buildOrderPayload(base).subtotal).toBe("100.00");
  });

  it("carries the idempotency key into metadata", () => {
    expect(buildOrderPayload(base).metadata?.idempotencyKey).toBe("idem-123");
  });

  it("defaults country to IN", () => {
    expect(buildOrderPayload(base).deliveryAddress.country).toBe("IN");
  });

  it("omits patientMemberIds when there is no patient", () => {
    expect(buildOrderPayload(base).patientMemberIds).toBeUndefined();
    expect(
      buildOrderPayload({ ...base, patientMemberId: "p1" }).patientMemberIds,
    ).toEqual(["p1"]);
  });

  it("marks isPurchased and clears skipPrescription only with a prescription", () => {
    const without = buildOrderPayload(base);
    expect(without.isPurchased).toBeUndefined();
    expect(without.prescriptionId).toBeUndefined();
    expect(without.metadata?.patientDetails?.skipPrescription).toBe(true);

    const withRx = buildOrderPayload({ ...base, prescriptionId: "rx1" });
    expect(withRx.isPurchased).toBe(true);
    expect(withRx.prescriptionId).toBe("rx1");
    expect(withRx.metadata?.patientDetails?.skipPrescription).toBe(false);
  });

  it("sends an empty coupon code rather than null", () => {
    expect(buildOrderPayload(base).metadata?.couponCode).toBe("");
    expect(
      buildOrderPayload({ ...base, couponCode: "SAVE20" }).metadata?.couponCode,
    ).toBe("SAVE20");
  });

  it("reflects the payment preference flags", () => {
    const payload = buildOrderPayload({
      ...base,
      walletUsed: true,
      coinsUsed: false,
      creditsUsed: true,
    });

    expect(payload.metadata?.preferences).toEqual({
      walletUsed: true,
      coinsUsed: false,
      creditsUsed: true,
      livePriceSyncUsed: false,
    });
  });

  it("derives discountAmount from the bill breakdown", () => {
    expect(buildOrderPayload(base).discountAmount).toBe("11.50");
  });
});
