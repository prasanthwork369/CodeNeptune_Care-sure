import React from "react";
import {
  renderWithProviders,
  fireEvent,
  waitFor,
} from "@/__tests__/test-utils/renderWithProviders";
import { CartItemCounter } from "@/src/features/cart/components/CartItemCounter";

describe("CartItemCounter Component", () => {
  const mockItem = { id: "item-101", qty: 2 };
  const mockUpdateItem = jest.fn().mockResolvedValue({ success: true });
  const mockRemoveItem = jest.fn().mockResolvedValue({ success: true });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders current quantity correctly", () => {
    const { getByText } = renderWithProviders(
      <CartItemCounter
        item={mockItem}
        updateItem={mockUpdateItem}
        removeItem={mockRemoveItem}
      />,
    );

    expect(getByText("2")).toBeTruthy();
  });

  it("increments item quantity when plus (+) button is pressed", async () => {
    const { getByText } = renderWithProviders(
      <CartItemCounter
        item={mockItem}
        updateItem={mockUpdateItem}
        removeItem={mockRemoveItem}
      />,
    );

    const plusBtn = getByText("+");
    fireEvent.press(plusBtn);

    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalledWith("item-101", { quantity: 3 });
    });
  });

  it("decrements item quantity when minus (−) button is pressed", async () => {
    const { getByText } = renderWithProviders(
      <CartItemCounter
        item={mockItem}
        updateItem={mockUpdateItem}
        removeItem={mockRemoveItem}
      />,
    );

    const minusBtn = getByText("−");
    fireEvent.press(minusBtn);

    await waitFor(() => {
      expect(mockUpdateItem).toHaveBeenCalledWith("item-101", { quantity: 1 });
    });
  });

  it("invokes removeItem when quantity drops to zero or below", async () => {
    const singleItem = { id: "item-101", qty: 1 };

    const { getByText } = renderWithProviders(
      <CartItemCounter
        item={singleItem}
        updateItem={mockUpdateItem}
        removeItem={mockRemoveItem}
      />,
    );

    const minusBtn = getByText("−");
    fireEvent.press(minusBtn);

    await waitFor(() => {
      expect(mockRemoveItem).toHaveBeenCalledWith("item-101");
      expect(mockUpdateItem).not.toHaveBeenCalled();
    });
  });
});
