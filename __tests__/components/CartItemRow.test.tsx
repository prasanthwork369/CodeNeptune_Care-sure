import React from "react";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { CartItemRow } from "@/src/features/cart/components/CartItemRow";
import { CartLine } from "@/src/features/cart/types";

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ push: jest.fn() }),
}));

const baseLine = (over: Partial<CartLine> = {}): CartLine => ({
  id: "line-1",
  productId: "prod-1",
  productIdResolved: true,
  medicineId: "med-1",
  name: "Paracetamol 500mg",
  brand: "Cipla",
  pack: "10 tablets",
  discount: "",
  mrp: 100,
  price: 100,
  qty: 1,
  image: null,
  rx: false,
  ...over,
});

describe("CartItemRow — price-changed indicator", () => {
  const noop = jest.fn();

  it("shows no price-changed note by default", () => {
    const { queryByText } = renderWithProviders(
      <CartItemRow
        line={baseLine()}
        compact={false}
        showDivider={false}
        onUpdateItem={noop}
        onRemoveItem={noop}
      />,
    );

    expect(queryByText(/Price updated/)).toBeNull();
  });

  it("warns the customer with the new price when priceChanged is true", () => {
    const { getByText } = renderWithProviders(
      <CartItemRow
        line={baseLine({ priceChanged: true, livePrice: 115 })}
        compact={false}
        showDivider={false}
        onUpdateItem={noop}
        onRemoveItem={noop}
      />,
    );

    expect(getByText("Price updated to ₹115.00")).toBeTruthy();
  });

  it("falls back to a generic notice when priceChanged is true but no live price is known", () => {
    const { getByText } = renderWithProviders(
      <CartItemRow
        line={baseLine({ priceChanged: true, livePrice: undefined })}
        compact={false}
        showDivider={false}
        onUpdateItem={noop}
        onRemoveItem={noop}
      />,
    );

    expect(getByText("Price updated since you added this")).toBeTruthy();
  });
});
