import React from "react";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { TrackingStatusBanner } from "@/src/components/profile/orders/tracking-sections/TrackingStatusBanner";

describe("TrackingStatusBanner", () => {
  it("renders nothing when the order is neither delayed nor cancelled", () => {
    const { toJSON } = renderWithProviders(
      <TrackingStatusBanner delayed={false} cancellationReason={null} />,
    );

    expect(toJSON()).toBeNull();
  });

  it("shows the delay banner when the order is delayed", () => {
    const { getByText, queryByText } = renderWithProviders(
      <TrackingStatusBanner delayed={true} cancellationReason={null} />,
    );

    expect(getByText("Your order is delayed")).toBeTruthy();
    expect(queryByText(/Order cancelled/)).toBeNull();
  });

  it("shows the cancellation reason when the order is cancelled", () => {
    const { getByText, queryByText } = renderWithProviders(
      <TrackingStatusBanner delayed={false} cancellationReason="Out of stock" />,
    );

    expect(getByText("Order cancelled: Out of stock")).toBeTruthy();
    expect(queryByText("Your order is delayed")).toBeNull();
  });

  it("prefers the cancellation banner when both are true", () => {
    const { getByText, queryByText } = renderWithProviders(
      <TrackingStatusBanner delayed={true} cancellationReason="Out of stock" />,
    );

    expect(getByText("Order cancelled: Out of stock")).toBeTruthy();
    expect(queryByText("Your order is delayed")).toBeNull();
  });
});
