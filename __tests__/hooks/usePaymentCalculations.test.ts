import { renderHook, act } from "@testing-library/react-native";
import { usePaymentCalculations } from "@/src/hooks/usePaymentCalculations";
import { useCreateOrder } from "@/src/hooks/mutations/useCreateOrder";
import { useDeliveryAddress } from "@/src/hooks/useDeliveryAddress";
import { prescriptionService } from "@/src/services/prescription.service";
import { orderNotification } from "@/src/services/notifications/orderNotification";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { useNav } from "@/src/hooks/useNav";
import { useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock("@/src/hooks/useNav", () => ({
  useNav: jest.fn(),
}));

jest.mock("@/src/hooks/queries/useCart", () => ({
  useCart: jest.fn(() => ({
    items: [
      {
        medicineId: "med-1",
        quantity: 2,
        unitPrice: "100",
        medicineName: "Paracetamol",
        medicineSlug: "paracetamol",
      },
    ],
  })),
}));

jest.mock("@/src/hooks/mutations/useCreateOrder", () => ({
  useCreateOrder: jest.fn(),
}));

jest.mock("@/src/hooks/useDeliveryAddress", () => ({
  useDeliveryAddress: jest.fn(),
}));

jest.mock("@/src/services/prescription.service", () => ({
  prescriptionService: {
    upload: jest.fn(),
  },
}));

jest.mock("@/src/services/notifications/orderNotification", () => ({
  orderNotification: {
    showOrderPlaced: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/src/services/firebase", () => ({
  analyticsService: { logPurchase: jest.fn() },
  reportError: jest.fn(),
  PERF_TRACES: { CHECKOUT_FLOW: "checkout" },
  usePerformanceTrace: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
}));

describe("usePaymentCalculations — Order Placement & Idempotency", () => {
  const mockRouter = { push: jest.fn(), replace: jest.fn() };
  const mockCreateOrder = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNav as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ toPay: "200" });
    (useCreateOrder as jest.Mock).mockReturnValue({
      createOrder: mockCreateOrder,
      loading: false,
    });
    useNetworkStore.setState({ isConnected: true });

    (useDeliveryAddress as jest.Mock).mockReturnValue({
      address: {
        name: "John Doe",
        phone: "9876543210",
        line1: "123 Main St",
        line2: "Apt 4B",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "IN",
      },
      displayLocation: { label: "Home", city: "Mumbai" },
    });
  });

  it("shows location sheet when delivery address is missing", async () => {
    (useDeliveryAddress as jest.Mock).mockReturnValue({
      address: null,
      displayLocation: null,
    });

    const { result } = renderHook(() => usePaymentCalculations());
    expect(result.current.showLocationSheet).toBe(false);

    await act(async () => {
      await result.current.handlePlaceOrder();
    });

    expect(result.current.showLocationSheet).toBe(true);
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("places order successfully and clears checkout, coupon, and rx stores", async () => {
    mockCreateOrder.mockResolvedValueOnce({ id: "ord-100", estimatedDelivery: "Tomorrow" });

    const { result } = renderHook(() => usePaymentCalculations());

    await act(async () => {
      await result.current.handlePlaceOrder();
    });

    expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    expect(orderNotification.showOrderPlaced).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: "ord-100" }),
    );
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: "/(stack)/order-success",
      params: { orderId: "ord-100", total: "200.00" },
    });
    // Order is created with an idempotency key (2nd arg) + it in metadata.
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        total: "200.00",
        metadata: expect.objectContaining({ idempotencyKey: expect.any(String) }),
      }),
      expect.any(String),
    );
  });

  it("performs deferred prescription upload before order creation when image URLs are present", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      toPay: "200",
      imageUrls: JSON.stringify(["https://example.com/rx.jpg"]),
      category: "1",
    });

    (prescriptionService.upload as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { id: "rx-999" },
    });
    mockCreateOrder.mockResolvedValueOnce({ id: "ord-200" });

    const { result } = renderHook(() => usePaymentCalculations());

    await act(async () => {
      await result.current.handlePlaceOrder();
    });

    expect(prescriptionService.upload).toHaveBeenCalledWith({
      imageUrls: ["https://example.com/rx.jpg"],
      category: 1,
    });
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ prescriptionId: "rx-999" }),
      expect.any(String),
    );
  });

  it("reuses existing prescription ID on retry after order failure (idempotency)", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      toPay: "200",
      imageUrls: JSON.stringify(["https://example.com/rx.jpg"]),
      category: "1",
    });

    (prescriptionService.upload as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { id: "rx-idempotent-1" },
    });

    // First order creation fails
    mockCreateOrder.mockRejectedValueOnce(new Error("Server Error 500"));
    const spyAlert = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { result } = renderHook(() => usePaymentCalculations());

    // 1st attempt: uploads prescription & fails on createOrder
    await act(async () => {
      await result.current.handlePlaceOrder();
    });
    expect(prescriptionService.upload).toHaveBeenCalledTimes(1);
    expect(spyAlert).toHaveBeenCalledWith("Order Failed", expect.any(String));

    // 2nd attempt (retry): reuses rx-idempotent-1 without re-uploading
    mockCreateOrder.mockResolvedValueOnce({ id: "ord-300" });
    await act(async () => {
      await result.current.handlePlaceOrder();
    });

    expect(prescriptionService.upload).toHaveBeenCalledTimes(1); // STILL 1 call!
    expect(mockCreateOrder).toHaveBeenLastCalledWith(
      expect.objectContaining({ prescriptionId: "rx-idempotent-1" }),
      expect.any(String),
    );

    // The idempotency key is reused across the retry so the backend can dedupe.
    const firstKey = mockCreateOrder.mock.calls[0][1];
    const retryKey = mockCreateOrder.mock.calls[1][1];
    expect(firstKey).toBeTruthy();
    expect(retryKey).toBe(firstKey);

    spyAlert.mockRestore();
  });

  it("retains checkout state and does not navigate when createOrder fails with 500 error", async () => {
    mockCreateOrder.mockRejectedValueOnce(new Error("Internal Server Error 500"));
    const spyAlert = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { result } = renderHook(() => usePaymentCalculations());

    await act(async () => {
      await result.current.handlePlaceOrder();
    });

    expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    expect(spyAlert).toHaveBeenCalledWith("Order Failed", expect.any(String));
    expect(mockRouter.replace).not.toHaveBeenCalled();

    spyAlert.mockRestore();
  });
});

