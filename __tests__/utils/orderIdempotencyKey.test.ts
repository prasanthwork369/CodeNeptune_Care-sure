/**
 * Regression cover for order idempotency.
 *
 * The key used to be sent only as an `Idempotency-Key` header and inside
 * `metadata.idempotencyKey`. order-service reads neither: createOrderSchema
 * validates a TOP-LEVEL `idempotencyKey` on the body, and
 * create-order.usecase.ts looks up `data.idempotencyKey` before doing any
 * work. So a retry after a dropped connection created a duplicate order.
 */
import { buildOrderPayload, OrderBillBreakdown } from "@/src/utils/orderPayload";

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
  id: "addr-1",
  name: "Asha",
  phone: "9999999999",
  line1: "12 MG Road",
  city: "Bengaluru",
  state: "KA",
  pincode: "560001",
};

const items = [
  {
    medicineId: "11111111-1111-4111-8111-111111111111",
    quantity: 1,
    unitPrice: "100",
  },
];

const build = (key = "idem-key-1") =>
  buildOrderPayload({
    items,
    address,
    bill: bill(),
    idempotencyKey: key,
    walletUsed: false,
    coinsUsed: false,
    creditsUsed: false,
  });

describe("buildOrderPayload idempotency key", () => {
  it("puts the key at the top level, where order-service reads it", () => {
    expect(build().idempotencyKey).toBe("idem-key-1");
  });

  it("keeps the existing metadata copy so nothing downstream breaks", () => {
    expect(build().metadata?.idempotencyKey).toBe("idem-key-1");
  });

  it("does not disturb the rest of the metadata blob", () => {
    const metadata = build().metadata;
    expect(metadata?.billBreakdown).toBeDefined();
    expect(metadata?.preferences).toBeDefined();
    expect(metadata?.patientDetails).toBeDefined();
    expect(metadata?.couponCode).toBe("");
  });

  it("reuses the caller's key verbatim so a retry dedupes", () => {
    const first = build("stable-key");
    const retry = build("stable-key");
    expect(first.idempotencyKey).toBe(retry.idempotencyKey);
  });
});
