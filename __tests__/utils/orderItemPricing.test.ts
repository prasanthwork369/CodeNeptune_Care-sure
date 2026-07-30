import { OrderItem } from "@/src/types/order";
import { getOrderItemPricing } from "@/src/utils/order";

const makeItem = (overrides: Partial<OrderItem> = {}): OrderItem => ({
  id: "item-1",
  orderId: "order-1",
  medicineId: "medicine-1",
  quantity: 1,
  unitPrice: "100",
  status: "1",
  ...overrides,
});

describe("getOrderItemPricing", () => {
  it("uses the direct item discountPercent", () => {
    expect(getOrderItemPricing(makeItem({ discountPercent: 15 }))).toEqual({
      mrp: 100,
      sellingPrice: 85,
      discountPercent: 15,
    });
  });

  it("uses the alternate direct item discountPercentage", () => {
    expect(
      getOrderItemPricing(
        makeItem({ discountPercentage: "22", unitPrice: "200" }),
      ),
    ).toEqual({
      mrp: 200,
      sellingPrice: 156,
      discountPercent: 22,
    });
  });

  it("falls back to snapshot discount fields after item fields", () => {
    expect(
      getOrderItemPricing(
        makeItem({
          discountPercent: 12,
          medicineSnapshot: {
            discountPercent: 18,
            discountPercentage: 20,
          },
        }),
      ).discountPercent,
    ).toBe(12);

    expect(
      getOrderItemPricing(
        makeItem({ medicineSnapshot: { discountPercent: 18 } }),
      ).discountPercent,
    ).toBe(18);
  });

  it("derives the discount from the item's own MRP and selling price", () => {
    expect(
      getOrderItemPricing(
        makeItem({ mrp: 100, sellingPrice: 80, unitPrice: undefined }),
      ),
    ).toEqual({
      mrp: 100,
      sellingPrice: 80,
      discountPercent: 20,
    });
  });

  it("keeps different item discounts independent in the same order", () => {
    const results = [
      makeItem({ mrp: 100, sellingPrice: 80 }),
      makeItem({
        id: "item-2",
        mrp: 200,
        sellingPrice: 150,
      }),
    ].map((item) => getOrderItemPricing(item));

    expect(results.map((item) => item.discountPercent)).toEqual([20, 25]);
  });

  it("supports numeric strings and legacy unitPrice as selling price", () => {
    expect(
      getOrderItemPricing(
        makeItem({
          mrp: "250",
          unitPrice: "200",
          sellingPrice: undefined,
        }),
      ),
    ).toEqual({
      mrp: 250,
      sellingPrice: 200,
      discountPercent: 20,
    });
  });

  it("shows no discount when only a selling price is available", () => {
    expect(
      getOrderItemPricing(
        makeItem({ unitPrice: undefined, sellingPrice: 100 }),
      ),
    ).toEqual({
      mrp: 100,
      sellingPrice: 100,
      discountPercent: 0,
    });
  });

  it.each([
    { mrp: 0, sellingPrice: 0 },
    { mrp: -100, sellingPrice: 80 },
    { mrp: 100, sellingPrice: 120 },
    { mrp: "invalid", sellingPrice: "NaN" },
    { mrp: 100, sellingPrice: -1 },
  ] satisfies Partial<OrderItem>[])(
    "does not derive a discount from invalid prices: %p",
    (overrides) => {
      expect(
        getOrderItemPricing(makeItem({ unitPrice: undefined, ...overrides }))
          .discountPercent,
      ).toBe(0);
    },
  );

  it.each([0, -10, 101, Number.NaN, Number.POSITIVE_INFINITY])(
    "ignores invalid direct discount %p",
    (discountPercent) => {
      expect(
        getOrderItemPricing(makeItem({ discountPercent, unitPrice: "100" }))
          .discountPercent,
      ).toBe(0);
    },
  );

  it("uses the order ratio only for price estimation and never for the badge", () => {
    expect(getOrderItemPricing(makeItem(), 0.8)).toEqual({
      mrp: 100,
      sellingPrice: 80,
      discountPercent: 0,
    });
  });
});
