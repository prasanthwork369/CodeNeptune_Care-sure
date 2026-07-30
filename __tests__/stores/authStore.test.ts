import { useAuthStore } from "@/src/store/authStore";
import { tokenStorage, guestStorage } from "@/src/lib/storage";
import { setAccessToken, getAccessToken } from "@/src/api/client";
import { profileApi } from "@/src/api/profile.api";
import { apiCache } from "@/src/lib/sqlite/cache";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { useCouponStore } from "@/src/store/couponStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { useLocationStore } from "@/src/store/locationStore";
import { useCheckoutStore } from "@/src/store/checkoutStore";
import { useReturnDraftStore } from "@/src/store/returnDraftStore";
import { usePrescriptionOrderStore } from "@/src/store/prescriptionOrderStore";
import { useCartPendingStore } from "@/src/store/cartStore";
import { AppError } from "@/src/api/errors";

jest.mock("@/src/lib/storage", () => ({
  tokenStorage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    setExpiresAt: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    clearExpiresAt: jest.fn().mockResolvedValue(undefined),
    clearRefreshToken: jest.fn().mockResolvedValue(undefined),
    clearAvatarUri: jest.fn().mockResolvedValue(undefined),
  },
  guestStorage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/src/api/profile.api", () => ({
  profileApi: {
    getProfile: jest.fn(),
  },
}));

jest.mock("@/src/lib/sqlite/cache", () => ({
  apiCache: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  },
}));

describe("useAuthStore — Auth State & Comprehensive Logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      isGuest: false,
      isLoaded: false,
      token: null,
      user: null,
    });
    setAccessToken(null);
  });

  it("login updates state, sets access token, and persists to tokenStorage", async () => {
    await useAuthStore.getState().login("auth-token-999", 3600);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isGuest).toBe(false);
    expect(state.token).toBe("auth-token-999");
    expect(getAccessToken()).toBe("auth-token-999");
    expect(tokenStorage.set).toHaveBeenCalledWith("auth-token-999");
    expect(guestStorage.clear).toHaveBeenCalled();
  });

  it("continueAsGuest marks user as guest and persists flag", async () => {
    await useAuthStore.getState().continueAsGuest();

    const state = useAuthStore.getState();
    expect(state.isGuest).toBe(true);
    expect(guestStorage.set).toHaveBeenCalledWith(true);
  });

  it("logout purges all user-specific Zustand stores, React Query, SQLite, and storage atomically", async () => {
    // Populate dummy state in ancillary stores
    usePrescriptionDraftStore.setState({
      items: [{ medicineId: "m1", quantity: 1 } as any],
    });
    useCouponStore.setState({
      applied: { code: "SAVE20", discount: 20 } as any,
    });
    useNotificationStore.setState({
      notifications: [{ id: "n1" } as any],
      unreadCount: 1,
    });
    useLocationStore.setState({ location: { label: "Home" } as any });
    useCheckoutStore.setState({
      bill: { toPay: 500 } as any,
      couponCode: "SAVE20",
    });
    useReturnDraftStore.setState({
      orderId: "o1",
      items: [{ orderItemId: "i1" } as any],
    });
    usePrescriptionOrderStore.setState({
      items: [{ medicineId: "m1" } as any],
    });
    useCartPendingStore.setState({
      guestCart: { items: [{ id: "g1" } as any] } as any,
    });

    const queryClearSpy = jest.spyOn(queryClient, "clear");

    // Perform logout
    await useAuthStore.getState().logout();

    // Verify main auth state reset
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isGuest).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(getAccessToken()).toBeNull();

    // Verify ancillary stores cleared
    expect(usePrescriptionDraftStore.getState().items).toEqual([]);
    expect(useCouponStore.getState().applied).toBeNull();
    expect(useNotificationStore.getState().notifications).toEqual([]);
    expect(useLocationStore.getState().location).toBeNull();
    expect(useCheckoutStore.getState().bill).toBeNull();
    expect(useReturnDraftStore.getState().items).toEqual([]);
    expect(usePrescriptionOrderStore.getState().items).toEqual([]);
    expect(useCartPendingStore.getState().guestCart.items).toEqual([]);

    // Verify cache & storage purges
    expect(queryClearSpy).toHaveBeenCalled();
    expect(apiCache.clear).toHaveBeenCalled();
    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(tokenStorage.clearExpiresAt).toHaveBeenCalled();
    expect(tokenStorage.clearRefreshToken).toHaveBeenCalled();
    expect(tokenStorage.clearAvatarUri).toHaveBeenCalled();
    expect(guestStorage.clear).toHaveBeenCalled();
  });

  it("initialize loads cached profile instantly and refreshes in background", async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValueOnce("stored-token-123");
    (apiCache.get as jest.Mock).mockReturnValueOnce({
      id: "u1",
      firstName: "CachedUser",
    });
    (profileApi.getProfile as jest.Mock).mockResolvedValueOnce({
      id: "u1",
      firstName: "RefreshedUser",
    });

    await useAuthStore.getState().initialize();
    await Promise.resolve(); // Flush microtask queue for background getProfile.then()

    expect(getAccessToken()).toBe("stored-token-123");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual({
      id: "u1",
      firstName: "RefreshedUser",
    });
    expect(apiCache.set).toHaveBeenCalledWith("customer_profile", {
      id: "u1",
      firstName: "RefreshedUser",
    });
  });

  it("initialize logs out silently on a confirmed auth failure (401 expired token)", async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValueOnce("expired-token");
    (apiCache.get as jest.Mock).mockReturnValueOnce(null);
    (profileApi.getProfile as jest.Mock).mockRejectedValueOnce(
      new AppError("unauthorized", "401 Unauthorized", 401),
    );

    const logoutSpy = jest.spyOn(useAuthStore.getState(), "logout");

    await useAuthStore.getState().initialize();
    await Promise.resolve(); // Flush microtask queue for background getProfile.catch()
    await Promise.resolve();

    expect(logoutSpy).toHaveBeenCalled();
  });

  it("initialize preserves the session when the profile fetch fails on a network error", async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValueOnce("valid-token");
    (apiCache.get as jest.Mock).mockReturnValueOnce({
      id: "u1",
      firstName: "CachedUser",
    });
    (profileApi.getProfile as jest.Mock).mockRejectedValueOnce(
      new AppError("network", "No Internet Connection."),
    );

    const logoutSpy = jest.spyOn(useAuthStore.getState(), "logout");

    await useAuthStore.getState().initialize();
    await Promise.resolve();
    await Promise.resolve();

    // Network failure must NOT log the user out — session stays on cached profile.
    expect(logoutSpy).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(getAccessToken()).toBe("valid-token");
  });
});
