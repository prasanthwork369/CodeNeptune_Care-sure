import React from "react";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { ItemsOrderedSection } from "@/src/features/orders/sections/tracking/ItemsOrderedSection";
import { OrderItem } from "@/src/features/orders/types";

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ push: jest.fn() }),
}));

function makeItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: "item-1",
    orderId: "order-1",
    medicineId: "med-1",
    quantity: 1,
    unitPrice: "100",
    status: "PENDING",
    medicineSnapshot: { name: "Paracetamol 500mg" },
    ...overrides,
  };
}

describe("ItemsOrderedSection", () => {
  it("shows the Return button with a deadline label when eligible", () => {
    const { getByText } = renderWithProviders(
      <ItemsOrderedSection
        items={[makeItem()]}
        orderId="order-1"
        showReturnButton
        returnDeadlineLabel="30 Jul 2026"
      />,
    );

    expect(getByText("Return")).toBeTruthy();
    expect(getByText("Returnable until 30 Jul 2026")).toBeTruthy();
  });

  it("shows the 'already exists' pill instead of the Return button when a return is active", () => {
    const { getByText, queryByText } = renderWithProviders(
      <ItemsOrderedSection
        items={[makeItem()]}
        orderId="order-1"
        showReturnButton={false}
        hasActiveReturnRequest
      />,
    );

    expect(getByText("Return Request Already Exists")).toBeTruthy();
    expect(queryByText("Return")).toBeNull();
  });

  it("shows the Cancel Order button when isCancellable", () => {
    const { getByText } = renderWithProviders(
      <ItemsOrderedSection items={[makeItem()]} orderId="order-1" isCancellable />,
    );

    expect(getByText("Cancel Order")).toBeTruthy();
  });

  it("hides every action while actionsDisabled (placeholder order data)", () => {
    const { queryByText } = renderWithProviders(
      <ItemsOrderedSection
        items={[makeItem()]}
        orderId="order-1"
        showReturnButton
        hasActiveReturnRequest
        isCancellable
        actionsDisabled
      />,
    );

    expect(queryByText("Return")).toBeNull();
    expect(queryByText("Return Request Already Exists")).toBeNull();
    expect(queryByText("Cancel Order")).toBeNull();
  });
});
