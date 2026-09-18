import { useAuthStore } from "@/src/store/authStore";
import { tokenStorage, guestStorage } from "@/src/lib/storage";
import { setAccessToken, getAccessToken } from "@/src/api/client";
import { profileApi } from "@/src/features/profile/api/profile.api";
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
import { requestQueue } from "@/src/utils/requestQueue";
import { messagingService as notificationService } from "@/src/services/firebase";

jest.mock("@/src/lib/storage", () => ({
  tokenStorage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    setExpiresAt: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    clearExpiresAt: jest.fn().mockResolvedValue(undefined),
    clearRefreshToken: jest.fn().mockResolvedValue(undefined),
  },
  guestStorage: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/src/features/profile/api/profile.api", () => ({
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

jest.mock("@/src/services/firebase", () => ({
  messagingService: {
    unregister: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("useAuthStore — Auth State & Comprehensive Logout", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      isGuest: false,
      isLoaded: false,
      token: null,
      user: null,
    });
    setAccessToken(null);
    await requestQueue.clear();
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
    expect(guestStorage.clear).toHaveBeenCalled();
  });

  it("logout clears any request queued offline during the previous session, so it can't replay under the next signed-in user", async () => {
    await requestQueue.add(
      {
        method: "patch",
        url: "/api/v1/customers/notifications/abc123/read",
      },
      () => {},
      () => {},
    );
    expect(requestQueue.length).toBe(1);

    await useAuthStore.getState().logout();

    expect(requestQueue.length).toBe(0);
  });

  it("initialize loads token and cached profile instantly from SQLite", async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValueOnce("stored-token-123");
    (apiCache.get as jest.Mock).mockReturnValueOnce({
      id: "u1",
      firstName: "CachedUser",
    });

    await useAuthStore.getState().initialize();

    expect(getAccessToken()).toBe("stored-token-123");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isLoaded).toBe(true);
    expect(useAuthStore.getState().user).toEqual({
      id: "u1",
      firstName: "CachedUser",
    });
    // profileApi.getProfile should NOT be called directly by authStore — useProfile owns network refresh
    expect(profileApi.getProfile).not.toHaveBeenCalled();
  });

  it("initialize restores guest session when no token is present", async () => {
    (tokenStorage.get as jest.Mock).mockResolvedValueOnce(null);
    (guestStorage.get as jest.Mock).mockResolvedValueOnce(true);

    await useAuthStore.getState().initialize();

    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isGuest).toBe(true);
    expect(useAuthStore.getState().isLoaded).toBe(true);
  });

  it("logout calls notificationService.unregister before clearing access token and session state", async () => {
    await useAuthStore.getState().login("valid-access-token", 3600);

    let tokenDuringUnregister: string | null = null;
    (notificationService.unregister as jest.Mock).mockImplementationOnce(async () => {
      tokenDuringUnregister = getAccessToken();
    });

    await useAuthStore.getState().logout();

    expect(notificationService.unregister).toHaveBeenCalledTimes(1);
    // Token must still be present during unregister so backend DELETE can authorize
    expect(tokenDuringUnregister).toBe("valid-access-token");
    // Token is cleared after unregister completes
    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it("401 / session-expiry path calling authStore.logout() triggers push unregistration and clears session", async () => {
    await useAuthStore.getState().login("expired-session-token", 3600);

    // Simulate 401 unauthorized handler invoking logout() directly
    await useAuthStore.getState().logout();

    expect(notificationService.unregister).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("logout completes successfully even when notificationService.unregister rejects (resilience to 401/network errors)", async () => {
    await useAuthStore.getState().login("stale-token", 3600);
    (notificationService.unregister as jest.Mock).mockRejectedValueOnce(
      new Error("Backend 401 or network offline"),
    );

    // Should not throw
    await expect(useAuthStore.getState().logout()).resolves.not.toThrow();

    expect(notificationService.unregister).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(tokenStorage.clear).toHaveBeenCalled();
  });

  it("User A logout followed by User B login clears previous session and cleanly sets new session", async () => {
    // 1. User A logs in
    await useAuthStore.getState().login("user-a-token", 3600);
    expect(useAuthStore.getState().token).toBe("user-a-token");
    expect(getAccessToken()).toBe("user-a-token");

    // 2. User A logs out (manual or 401)
    await useAuthStore.getState().logout();
    expect(notificationService.unregister).toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBeNull();
    expect(getAccessToken()).toBeNull();

    // 3. User B logs in on the same device
    await useAuthStore.getState().login("user-b-token", 7200);
    expect(useAuthStore.getState().token).toBe("user-b-token");
    expect(getAccessToken()).toBe("user-b-token");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(tokenStorage.set).toHaveBeenCalledWith("user-b-token");
  });

  it("handles duplicate and concurrent logout invocations safely", async () => {
    await useAuthStore.getState().login("concurrent-token", 3600);

    // Trigger duplicate/concurrent logout calls
    await expect(
      Promise.all([
        useAuthStore.getState().logout(),
        useAuthStore.getState().logout(),
      ]),
    ).resolves.not.toThrow();

    // Concurrent 401s must not unregister the push token twice
    expect(notificationService.unregister).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("allows a later session to log out again after a previous logout settled", async () => {
    await useAuthStore.getState().login("session-one", 3600);
    await useAuthStore.getState().logout();
    expect(notificationService.unregister).toHaveBeenCalledTimes(1);

    // The in-flight guard must reset, or the next user could never unregister
    await useAuthStore.getState().login("session-two", 3600);
    await useAuthStore.getState().logout();
    expect(notificationService.unregister).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBeNull();
  });
});
