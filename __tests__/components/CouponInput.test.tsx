import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { CouponInput } from "@/src/features/cart/coupons/CouponInput";

describe("CouponInput", () => {
  it("disables Apply when the code is empty or whitespace-only", () => {
    const onApply = jest.fn();
    const { getByText, rerender } = render(
      <CouponInput value="" onChangeText={jest.fn()} onApply={onApply} />,
    );

    fireEvent.press(getByText("APPLY"));
    expect(onApply).not.toHaveBeenCalled();

    rerender(
      <CouponInput value="   " onChangeText={jest.fn()} onApply={onApply} />,
    );
    fireEvent.press(getByText("APPLY"));
    expect(onApply).not.toHaveBeenCalled();
  });

  it("enables Apply once a code is entered", () => {
    const onApply = jest.fn();
    const { getByText } = render(
      <CouponInput value="SAVE10" onChangeText={jest.fn()} onApply={onApply} />,
    );

    fireEvent.press(getByText("APPLY"));
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});
