import { NotificationNavigation } from "@/src/services/notifications/NotificationNavigation";
import { NotificationType } from "@/src/types/notification";
import { useAuthStore } from "@/src/store/authStore";
import { useNotificationNavigationStore } from "@/src/store/notificationNavigationStore";
import { router } from "expo-router";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

describe("NotificationNavigation — Route Resolution & Tap Deduplication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ isAuthenticated: true });
    useNotificationNavigationStore.setState({
      lastHandledTapId: null,
      pendingNotification: null,
    });
  });

  it("deduplicates tap events matching lastHandledTapId", () => {
    const payload = { type: NotificationType.HOME };

    NotificationNavigation.handleTap(payload, "tap-uuid-123");
    expect(router.push).toHaveBeenCalledWith("/(tabs)");

    // Immediate duplicate tap with same tapId should be ignored
    NotificationNavigation.handleTap(payload, "tap-uuid-123");
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it("caches notification and redirects unauthenticated user to login for auth-required types", () => {
    useAuthStore.setState({ isAuthenticated: false });

    const payload = {
      type: NotificationType.ORDER_PLACED,
      data: { orderId: "ord-88" },
    };

    NotificationNavigation.handleTap(payload, "tap-uuid-999");

    expect(useNotificationNavigationStore.getState().pendingNotification).toEqual(payload);
    expect(router.push).toHaveBeenCalledWith("/(auth)/login");
  });

  it("navigates directly to order tracking screen when user is authenticated", () => {
    const payload = {
      type: NotificationType.ORDER_SHIPPED,
      data: { orderId: "ord-777" },
    };

    NotificationNavigation.handleTap(payload);

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/profile/orders/track",
      params: { orderId: "ord-777" },
    });
  });

  it("navigates to product detail screen for product notification type", () => {
    const payload = {
      type: NotificationType.PRODUCT,
      data: { productId: "prod-456" },
    };

    NotificationNavigation.handleTap(payload);

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/product/[id]",
      params: { id: "prod-456" },
    });
  });
});
