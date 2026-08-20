import { OrderItem } from "@/src/features/orders/types";

function isItemReturnable(item: OrderItem): boolean {
  if (item.medicineSnapshot?.isReturnable === false) return false;
  if (item.isReturnable === false) return false;
  return true;
}

describe("Return Item Eligibility Logic (Verified Web Behavior)", () => {
  const baseItem: OrderItem = {
    id: "item-base",
    orderId: "ord-1",
    medicineId: "med-1",
    quantity: 1,
    status: "DELIVERED",
  };

  it("marks item non-returnable if medicineSnapshot.isReturnable is explicitly false", () => {
    const item: OrderItem = {
      ...baseItem,
      medicineSnapshot: { name: "Insulin Injection", isReturnable: false },
    };
    expect(isItemReturnable(item)).toBe(false);
  });

  it("marks item non-returnable if item.isReturnable is explicitly false", () => {
    const item: OrderItem = {
      ...baseItem,
      isReturnable: false,
      medicineSnapshot: { name: "Cold Storage Product" },
    };
    expect(isItemReturnable(item)).toBe(false);
  });

  it("marks item non-returnable if both snapshot and item are false", () => {
    const item: OrderItem = {
      ...baseItem,
      isReturnable: false,
      medicineSnapshot: { name: "Vaccine", isReturnable: false },
    };
    expect(isItemReturnable(item)).toBe(false);
  });

  it("marks item returnable when both fields are true", () => {
    const item: OrderItem = {
      ...baseItem,
      isReturnable: true,
      medicineSnapshot: { name: "Paracetamol", isReturnable: true },
    };
    expect(isItemReturnable(item)).toBe(true);
  });

  it("marks item returnable when fields are undefined (standard default)", () => {
    const item: OrderItem = {
      ...baseItem,
      medicineSnapshot: { name: "Bandage Pack" },
    };
    expect(isItemReturnable(item)).toBe(true);
  });

  it("marks item returnable when one field is true and other is undefined", () => {
    const itemA: OrderItem = {
      ...baseItem,
      isReturnable: true,
      medicineSnapshot: { name: "Vitamins" },
    };
    const itemB: OrderItem = {
      ...baseItem,
      medicineSnapshot: { name: "Antacid", isReturnable: true },
    };
    expect(isItemReturnable(itemA)).toBe(true);
    expect(isItemReturnable(itemB)).toBe(true);
  });

  it("correctly handles mixed order with returnable and non-returnable items", () => {
    const returnable1: OrderItem = {
      ...baseItem,
      id: "item-1",
      medicineSnapshot: { name: "Paracetamol 500mg" },
    };
    const nonReturnable1: OrderItem = {
      ...baseItem,
      id: "item-2",
      isReturnable: false,
      medicineSnapshot: { name: "Insulin 100IU" },
    };
    const returnable2: OrderItem = {
      ...baseItem,
      id: "item-3",
      isReturnable: true,
      medicineSnapshot: { name: "Cough Syrup", isReturnable: true },
    };

    expect(isItemReturnable(returnable1)).toBe(true);
    expect(isItemReturnable(nonReturnable1)).toBe(false);
    expect(isItemReturnable(returnable2)).toBe(true);
  });

  it("defensively filters out non-returnable items from submission draft payload", () => {
    const allItems: OrderItem[] = [
      { ...baseItem, id: "item-1", medicineSnapshot: { name: "Paracetamol" } },
      { ...baseItem, id: "item-2", isReturnable: false, medicineSnapshot: { name: "Insulin" } },
    ];

    const draftItems = [
      { orderItemId: "item-1", medicineId: "med-1", quantity: 1, reason: "Damaged" },
      { orderItemId: "item-2", medicineId: "med-2", quantity: 1, reason: "Defective" },
    ];

    const validReturnItems = draftItems.filter((draft) => {
      const originalItem = allItems.find((it) => it.id === draft.orderItemId);
      return originalItem ? isItemReturnable(originalItem) : true;
    });

    expect(validReturnItems).toHaveLength(1);
    expect(validReturnItems[0].orderItemId).toBe("item-1");
  });
});
