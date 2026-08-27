import React from "react";
import {
  renderWithProviders,
  fireEvent,
  waitFor,
} from "@/__tests__/test-utils/renderWithProviders";
import { CancelOrderLayout } from "@/src/features/orders/screens/CancelOrderLayout";
import { useOrderById } from "@/src/features/orders/hooks/useOrderById";
import { useCancellationReasons } from "@/src/features/orders/hooks/useCancellationReasons";
import { orderApi } from "@/src/features/orders/api/order.api";
import { requireInternet } from "@/src/utils/offline";
import { useLocalSearchParams } from "expo-router";

// CancelOrderLayout no longer navigates itself, but its ScreenHeader still
// calls useNav() for the back arrow, so it needs a working mock here too.
jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ back: jest.fn() }),
}));

jest.mock("@/src/hooks/ui/useBottomInset", () => ({
  useAdjustedBottomInset: () => 0,
}));

jest.mock("react-native-keyboard-controller", () => {
  const { ScrollView } = jest.requireActual("react-native");
  return { KeyboardAwareScrollView: ScrollView };
});

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => ({ orderId: "order-1" })),
}));

jest.mock("@/src/features/orders/hooks/useOrderById");
jest.mock("@/src/features/orders/hooks/useCancellationReasons");
jest.mock("@/src/features/orders/api/order.api", () => ({
  orderApi: { cancelOrder: jest.fn() },
}));
jest.mock("@/src/utils/offline", () => ({
  requireInternet: jest.fn(() => true),
}));

const mockUseOrderById = useOrderById as jest.MockedFunction<
  typeof useOrderById
>;
const mockUseCancellationReasons = useCancellationReasons as jest.Mock;
const mockCancelOrder = orderApi.cancelOrder as jest.Mock;
const mockRequireInternet = requireInternet as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe("CancelOrderLayout confirmation modal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ orderId: "order-1" });
    mockRequireInternet.mockReturnValue(true);
    mockUseOrderById.mockReturnValue({
      order: {
        orderId: "order-1",
        items: [{ id: "item-1" }],
        total: 500,
      } as any,
      loading: false,
      isFetching: false,
      error: null,
      refetch: jest.fn(),
      isPlaceholderData: false,
    });
    mockUseCancellationReasons.mockReturnValue({
      data: [{ id: 1, label: "Ordered by mistake", description: "" }],
      isLoading: false,
    });
  });

  it("does not call the cancel API on the first tap — it opens the confirm modal instead", () => {
    const { getByText, getByTestId } = renderWithProviders(
      <CancelOrderLayout />,
    );

    fireEvent.press(getByText("Ordered by mistake"));
    fireEvent.press(getByTestId("cancel-order-submit"));

    expect(mockCancelOrder).not.toHaveBeenCalled();
    expect(getByText("Confirm Cancellation")).toBeTruthy();
    expect(
      getByText("Are you sure you want to cancel this order?"),
    ).toBeTruthy();
  });

  it("Keep dismisses the modal without calling the API", () => {
    const { getByText, getByTestId, queryByText } = renderWithProviders(
      <CancelOrderLayout />,
    );

    fireEvent.press(getByText("Ordered by mistake"));
    fireEvent.press(getByTestId("cancel-order-submit"));
    fireEvent.press(getByText("Keep"));

    expect(mockCancelOrder).not.toHaveBeenCalled();
    expect(queryByText("Confirm Cancellation")).toBeNull();
  });

  it("calls the cancel API exactly once after confirming", async () => {
    mockCancelOrder.mockResolvedValue(undefined);
    const { getByText, getByTestId } = renderWithProviders(
      <CancelOrderLayout />,
    );

    fireEvent.press(getByText("Ordered by mistake"));
    fireEvent.press(getByTestId("cancel-order-submit"));
    fireEvent.press(getByTestId("cancel-order-confirm"));

    await waitFor(() => {
      expect(mockCancelOrder).toHaveBeenCalledTimes(1);
      expect(mockCancelOrder).toHaveBeenCalledWith(
        "order-1",
        "Ordered by mistake",
      );
    });
  });

  it("disables the confirm button while the cancel request is in flight", async () => {
    let resolveCancel: () => void = () => {};
    mockCancelOrder.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveCancel = resolve;
      }),
    );
    const { getByText, getByTestId } = renderWithProviders(
      <CancelOrderLayout />,
    );

    fireEvent.press(getByText("Ordered by mistake"));
    fireEvent.press(getByTestId("cancel-order-submit"));
    fireEvent.press(getByTestId("cancel-order-confirm"));
    // A second tap while the first request is in flight must not fire again.
    fireEvent.press(getByTestId("cancel-order-confirm"));

    expect(mockCancelOrder).toHaveBeenCalledTimes(1);

    resolveCancel();
    await waitFor(() => {
      expect(getByText("Order cancelled successfully!")).toBeTruthy();
    });
  });

  it("keeps the bottom button disabled with no reason selected", () => {
    const { getByTestId, queryByText } = renderWithProviders(
      <CancelOrderLayout />,
    );

    fireEvent.press(getByTestId("cancel-order-submit"));

    expect(mockCancelOrder).not.toHaveBeenCalled();
    expect(queryByText("Confirm Cancellation")).toBeNull();
  });

  it("keeps the bottom button disabled when 'Other' is selected with empty text", () => {
    const { getByText, getByTestId, queryByText } = renderWithProviders(
      <CancelOrderLayout />,
    );

    fireEvent.press(getByText("Other Reason"));
    fireEvent.press(getByTestId("cancel-order-submit"));

    expect(mockCancelOrder).not.toHaveBeenCalled();
    expect(queryByText("Confirm Cancellation")).toBeNull();
  });

  it("dismisses the success alert on OK without navigating away", async () => {
    mockCancelOrder.mockResolvedValue(undefined);
    const { getByText, getByTestId, queryByText } = renderWithProviders(
      <CancelOrderLayout />,
    );

    fireEvent.press(getByText("Ordered by mistake"));
    fireEvent.press(getByTestId("cancel-order-submit"));
    fireEvent.press(getByTestId("cancel-order-confirm"));

    await waitFor(() => {
      expect(getByText("Order cancelled successfully!")).toBeTruthy();
    });

    fireEvent.press(getByText("OK"));
    expect(queryByText("Order cancelled successfully!")).toBeNull();
  });

  it("on API failure, closes the confirm modal, shows an error, and preserves the selected reason", async () => {
    mockCancelOrder.mockRejectedValue(new Error("network down"));
    const { getByText, getByTestId, queryByText } = renderWithProviders(
      <CancelOrderLayout />,
    );

    fireEvent.press(getByText("Ordered by mistake"));
    fireEvent.press(getByTestId("cancel-order-submit"));
    fireEvent.press(getByTestId("cancel-order-confirm"));

    await waitFor(() => {
      expect(
        getByText("Failed to cancel order. Please try again."),
      ).toBeTruthy();
    });
    expect(queryByText("Confirm Cancellation")).toBeNull();

    // Reason selection survives the failure — re-opening the modal still shows it selected.
    fireEvent.press(getByText("OK"));
    // Past the submit button's anti-double-tap throttle window before re-pressing it.
    await new Promise((resolve) => setTimeout(resolve, 600));
    fireEvent.press(getByTestId("cancel-order-submit"));
    expect(getByText("Confirm Cancellation")).toBeTruthy();
  });
});
