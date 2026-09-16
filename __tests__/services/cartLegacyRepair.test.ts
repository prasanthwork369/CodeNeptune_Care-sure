/**
 * Cover for the one-time repair of cart rows written before the variant-id fix.
 *
 * Those rows hold a `medicine_variants.id` in `medicineId`. Catalog and
 * pricing are both keyed to `medicines.id` by foreign key, so order-service
 * rejects the order. The fix stops new bad rows; this rewrites the old ones.
 */
import {
  repairLegacyVariantCartRows,
  __testing,
} from "@/src/features/cart/services/cartLegacyRepair";
import { cartApi } from "@/src/features/cart/api/cart.api";
import { medicineApi } from "@/src/features/product/api/medicine.api";
import type { Cart, CartItem } from "@/src/features/cart/types";

jest.mock("@/src/features/cart/api/cart.api", () => ({
  cartApi: { addItem: jest.fn(), removeItem: jest.fn() },
}));

jest.mock("@/src/features/product/api/medicine.api", () => ({
  medicineApi: { getProductByCatalogId: jest.fn() },
}));

const PARENT = "11111111-1111-4111-8111-111111111111";
const VARIANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const row = (over: Partial<CartItem> = {}): CartItem =>
  ({
    id: "row-1",
    cartId: "cart-1",
    medicineId: VARIANT,
    medicineName: "Zincovit",
    medicineSlug: "zincovit",
    unitPrice: 120,
    quantity: 2,
    requiresPrescription: false,
    createdAt: "",
    updatedAt: "",
    metadata: { selectedVariantId: VARIANT, productId: "CS-ABC123" },
    ...over,
  }) as CartItem;

const cart = (items: CartItem[]): Cart => ({ items }) as Cart;

const invalidateQueries = jest.fn();
// Only the one method the repair calls; cast at the call sites below.
const queryClient = { invalidateQueries } as unknown as Parameters<
  typeof repairLegacyVariantCartRows
>[0];

describe("isLegacyVariantRow", () => {
  it("flags a row whose medicineId equals its own selectedVariantId", () => {
    expect(__testing.isLegacyVariantRow(row())).toBe(true);
  });

  it("ignores a correctly written variant row", () => {
    expect(
      __testing.isLegacyVariantRow(row({ medicineId: PARENT })),
    ).toBe(false);
  });

  it("ignores a row with no variant at all", () => {
    expect(
      __testing.isLegacyVariantRow(
        row({ medicineId: PARENT, metadata: { productId: "CS-ABC123" } }),
      ),
    ).toBe(false);
  });
});

describe("repairLegacyVariantCartRows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (medicineApi.getProductByCatalogId as jest.Mock).mockResolvedValue({
      id: PARENT,
      slug: "zincovit",
    });
    (cartApi.addItem as jest.Mock).mockResolvedValue({ items: [] });
    (cartApi.removeItem as jest.Mock).mockResolvedValue({ items: [] });
  });

  it("rewrites the row with the parent medicineId", async () => {
    const repaired = await repairLegacyVariantCartRows(
      queryClient,
      cart([row()]),
    );

    expect(repaired).toBe(1);
    const payload = (cartApi.addItem as jest.Mock).mock.calls[0][0];
    expect(payload.medicineId).toBe(PARENT);
    expect(payload.metadata.selectedVariantId).toBe(VARIANT);
    expect(payload.quantity).toBe(2);
  });

  it("adds the corrected row before removing the broken one", async () => {
    const order: string[] = [];
    (cartApi.addItem as jest.Mock).mockImplementation(async () => {
      order.push("add");
      return { items: [] };
    });
    (cartApi.removeItem as jest.Mock).mockImplementation(async () => {
      order.push("remove");
      return { items: [] };
    });

    await repairLegacyVariantCartRows(queryClient, cart([row()]));

    // Add-then-remove: a failed add must never lose the customer's item.
    expect(order).toEqual(["add", "remove"]);
  });

  it("leaves the broken row in place when the add fails", async () => {
    (cartApi.addItem as jest.Mock).mockRejectedValueOnce(new Error("500"));

    const repaired = await repairLegacyVariantCartRows(
      queryClient,
      cart([row()]),
    );

    expect(repaired).toBe(0);
    expect(cartApi.removeItem).not.toHaveBeenCalled();
  });

  it("skips a row with no catalog id to resolve the parent from", async () => {
    const orphan = row({ metadata: { selectedVariantId: VARIANT } });

    const repaired = await repairLegacyVariantCartRows(
      queryClient,
      cart([orphan]),
    );

    expect(repaired).toBe(0);
    expect(cartApi.addItem).not.toHaveBeenCalled();
  });

  it("does not touch a healthy cart, and issues no invalidate", async () => {
    const repaired = await repairLegacyVariantCartRows(
      queryClient,
      cart([row({ medicineId: PARENT })]),
    );

    expect(repaired).toBe(0);
    expect(cartApi.addItem).not.toHaveBeenCalled();
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it("repairs the good rows even when one is unresolvable", async () => {
    (medicineApi.getProductByCatalogId as jest.Mock)
      .mockRejectedValueOnce(new Error("404"))
      .mockResolvedValueOnce({ id: PARENT, slug: "zincovit" });

    const repaired = await repairLegacyVariantCartRows(
      queryClient,
      cart([row({ id: "row-1" }), row({ id: "row-2" })]),
    );

    expect(repaired).toBe(1);
    expect(cartApi.removeItem).toHaveBeenCalledWith("row-2");
  });

  it("is idempotent — a repaired row is no longer detected", async () => {
    await repairLegacyVariantCartRows(queryClient, cart([row()]));
    const rewritten = (cartApi.addItem as jest.Mock).mock.calls[0][0];

    expect(
      __testing.isLegacyVariantRow(
        row({ medicineId: rewritten.medicineId, metadata: rewritten.metadata }),
      ),
    ).toBe(false);
  });
});
