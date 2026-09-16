/**
 * `unitPrice` is the selling price and `mrpPrice` the strikethrough —
 * order-service sums unitPrice * quantity for the subtotal (cart.entity.ts),
 * and customer-website writes the same shape. Mobile used to write the MRP
 * into unitPrice, so the helper still has to read those old rows correctly.
 */
import { resolveCartLinePricing } from "@/src/features/cart/utils/cartPricing";
import type { CartItem } from "@/src/features/cart/types";

const item = (over: Partial<CartItem>): CartItem =>
  ({ quantity: 1, ...over }) as CartItem;

describe("resolveCartLinePricing — current rows", () => {
  it("uses unitPrice as the payable price", () => {
    const p = resolveCartLinePricing(
      item({ unitPrice: 90, mrpPrice: 100, discountPercent: 10 }),
    );
    expect(p.price).toBe(90);
    expect(p.mrp).toBe(100);
  });

  it("keeps mrp equal to price when there is no discount", () => {
    const p = resolveCartLinePricing(item({ unitPrice: 100, mrpPrice: 100 }));
    expect(p.price).toBe(100);
    expect(p.mrp).toBe(100);
  });

  it("does not treat a 0% line as legacy even when the prices match", () => {
    const p = resolveCartLinePricing(
      item({ unitPrice: 100, mrpPrice: 100, discountPercent: 0 }),
    );
    expect(p.price).toBe(100);
  });

  it("ignores an mrpPrice lower than unitPrice", () => {
    const p = resolveCartLinePricing(item({ unitPrice: 90, mrpPrice: 80 }));
    expect(p.price).toBe(90);
    expect(p.mrp).toBe(90);
  });

  it("falls back to originalPrice when mrpPrice is absent", () => {
    const p = resolveCartLinePricing(
      item({ unitPrice: 90, originalPrice: 120, discountPercent: 25 }),
    );
    expect(p.price).toBe(90);
    expect(p.mrp).toBe(120);
  });

  it("parses string money from the API", () => {
    const p = resolveCartLinePricing(
      item({ unitPrice: "90.50", mrpPrice: "100.00", discountPercent: 10 }),
    );
    expect(p.price).toBeCloseTo(90.5);
    expect(p.mrp).toBeCloseTo(100);
  });
});

describe("resolveCartLinePricing — rows written before the fix", () => {
  // The old write path sent the MRP as both unitPrice and mrp, so a
  // discounted line ended up with unitPrice === mrpPrice.
  it("derives the price from a legacy MRP-in-unitPrice row", () => {
    const p = resolveCartLinePricing(
      item({ unitPrice: 100, mrpPrice: 100, discountPercent: 20 }),
    );
    expect(p.price).toBe(80);
    expect(p.mrp).toBe(100);
  });

  it("reads discountPercent out of metadata when the column is unset", () => {
    const p = resolveCartLinePricing(
      item({ unitPrice: 200, mrpPrice: 200, metadata: { discountPercent: 50 } }),
    );
    expect(p.price).toBe(100);
    expect(p.mrp).toBe(200);
  });

  it("handles a legacy row with no mrpPrice at all", () => {
    const p = resolveCartLinePricing(
      item({ unitPrice: 100, discountPercent: 10 }),
    );
    expect(p.price).toBe(90);
    expect(p.mrp).toBe(100);
  });

  // Guards the boundary between the two shapes: once unitPrice drops below
  // the MRP the row is current and must not be discounted a second time.
  it("never applies the discount twice to a current row", () => {
    const p = resolveCartLinePricing(
      item({ unitPrice: 80, mrpPrice: 100, discountPercent: 20 }),
    );
    expect(p.price).toBe(80);
  });
});
