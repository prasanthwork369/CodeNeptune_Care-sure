import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { useOtp } from "@/src/features/auth/hooks/useOtp";
import { useAuth } from "@/src/hooks/mutations/useAuth";
import { cartApi } from "@/src/features/cart/api/cart.api";
import { useAuthStore } from "@/src/store/authStore";
import { useCheckoutDraftStore } from "@/src/store/checkoutDraftStore";
import { useCartPendingStore } from "@/src/store/cartStore";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useNotificationNavigationStore } from "@/src/store/notificationNavigationStore";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { useNav } from "@/src/hooks/useNav";
import { useLocalSearchParams } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock("@/src/hooks/useNav", () => ({
  useNav: jest.fn(),
}));

jest.mock("@/src/hooks/mutations/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/src/features/cart/api/cart.api", () => ({
  cartApi: {
    addItem: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock("@/src/services/firebase", () => ({
  analyticsService: { logLoginSuccess: jest.fn() },
}));

jest.mock("@/src/services/notifications/NotificationNavigation", () => ({
  NotificationNavigation: { executeNavigation: jest.fn() },
}));

const createQueryClientWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useOtp — OTP Flow & Guest Cart Merge", () => {
  const mockRouter = { replace: jest.fn(), push: jest.fn() };
  const mockVerifyOtp = jest.fn();
  const mockRequestOtp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNav as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      phone: "9876543210",
    });
    (useAuth as jest.Mock).mockReturnValue({
      verifyOtp: mockVerifyOtp,
      requestOtp: mockRequestOtp,
      loading: false,
      error: null,
      resetError: jest.fn(),
    });
    useNetworkStore.setState({ isConnected: true });
    useCartPendingStore.getState().clearGuestCart();
    useNotificationNavigationStore.getState().clearPendingNotification();
  });

  it("initializes with 30 second resend cooldown", () => {
    const { result } = renderHook(() => useOtp(), {
      wrapper: createQueryClientWrapper(),
    });
    expect(result.current.resendCooldown).toBe(30);
    expect(result.current.phone).toBe("9876543210");
  });

  it("prevents double submission when verification is already in progress", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      verifyOtp: mockVerifyOtp,
      requestOtp: mockRequestOtp,
      loading: true, // Verification in flight
      error: null,
      resetError: jest.fn(),
    });

    const { result } = renderHook(() => useOtp(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      await result.current.handleVerify("123456");
    });

    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });

  it("verifies valid OTP, redirects to tabs, and merges guest cart in background", async () => {
    mockVerifyOtp.mockResolvedValueOnce({ success: true });

    // Seed guest cart with an item
    useCartPendingStore.getState().addGuestItem({
      medicineId: "med-101",
      variantId: null,
      medicineName: "Vitamin C",
      medicineSlug: "vitamin-c",
      unitPrice: 50,
      mrp: 50,
      discountPercent: 0,
      quantity: 2,
      requiresPrescription: false,
    });

    const { result } = renderHook(() => useOtp(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      await result.current.handleVerify("123456");
    });

    expect(mockVerifyOtp).toHaveBeenCalledWith("9876543210", "123456");
    expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)");

    // Flush microtasks for background guest cart merge loop
    await Promise.resolve();
    await Promise.resolve();

    expect(cartApi.addItem).toHaveBeenCalledWith(
      expect.objectContaining({ medicineId: "med-101", quantity: 2 }),
    );
    expect(useCartPendingStore.getState().guestCart.items).toEqual([]);
  });

  it("executes pending notification navigation upon verification if notification exists", async () => {
    mockVerifyOtp.mockResolvedValueOnce({ success: true });
    useNotificationNavigationStore.setState({
      pendingNotification: {
        id: "notif-1",
        route: "/(stack)/order-details",
      } as any,
    });

    const { result } = renderHook(() => useOtp(), {
      wrapper: createQueryClientWrapper(),
    });

    await act(async () => {
      await result.current.handleVerify("654321");
    });

    expect(
      useNotificationNavigationStore.getState().pendingNotification,
    ).toBeNull();
  });
});
