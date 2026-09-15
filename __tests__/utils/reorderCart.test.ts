import { buildCartInputs } from "@/src/features/orders/utils/reorderCart";
import { searchApi } from "@/src/features/search/api/search.api";
import { OrderItem } from "@/src/features/orders/types";

jest.mock("@/src/features/search/api/search.api", () => ({
  searchApi: {
    searchMedicines: jest.fn(),
  },
}));

const mockSearchMedicines = searchApi.searchMedicines as jest.Mock;

const orderItem = (over: Partial<OrderItem> = {}): OrderItem => ({
  id: "oi-1",
  orderId: "ord-1",
  medicineId: "med-1",
  quantity: 2,
  unitPrice: "100",
  status: "delivered",
  medicineSnapshot: { name: "Paracetamol", slug: "paracetamol" },
  ...over,
});

describe("buildCartInputs (reorder pricing)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // unitPrice on an OrderItem is stored as the MRP; the real discount the
  // customer got must be carried through, not dropped to 0 on reorder.
  it("reads the order item's real discount instead of hardcoding 0", async () => {
    const [input] = await buildCartInputs([
      orderItem({ discountPercent: 15 }),
    ]);

    expect(input).toMatchObject({
      unitPrice: 100,
      mrp: 100,
      discountPercent: 15,
    });
  });

  it("falls back to discountPercentage or the medicineSnapshot's discount when the top-level field is absent", async () => {
    const [viaPercentage] = await buildCartInputs([
      orderItem({ discountPercent: undefined, discountPercentage: 12 }),
    ]);
    expect(viaPercentage.discountPercent).toBe(12);

    const [viaSnapshot] = await buildCartInputs([
      orderItem({
        discountPercent: undefined,
        discountPercentage: undefined,
        medicineSnapshot: {
          name: "Paracetamol",
          slug: "paracetamol",
          discountPercent: 8,
        },
      }),
    ]);
    expect(viaSnapshot.discountPercent).toBe(8);
  });

  it("defaults to 0 discount only when no discount field exists anywhere", async () => {
    const [input] = await buildCartInputs([orderItem()]);
    expect(input.discountPercent).toBe(0);
  });

  // The live-price fallback (item.unitPrice missing) must carry the live
  // discount through too, not just the live price.
  it("carries the live discount through the live-price fallback", async () => {
    mockSearchMedicines.mockResolvedValue({
      data: [
        {
          id: "med-1",
          productId: "CS-1",
          slug: "paracetamol",
          mrp: "120",
          price: "96",
          discountPercentage: 20,
        },
      ],
    });

    const [input] = await buildCartInputs([
      orderItem({ unitPrice: undefined, discountPercent: undefined }),
    ]);

    expect(input).toMatchObject({
      unitPrice: 120,
      mrp: 120,
      discountPercent: 20,
    });
  });

  it("skips an item with no resolvable price from either the order or a live lookup", async () => {
    mockSearchMedicines.mockResolvedValue({ data: [] });

    const result = await buildCartInputs([
      orderItem({ unitPrice: undefined, discountPercent: undefined }),
    ]);

    expect(result).toEqual([]);
  });
});
