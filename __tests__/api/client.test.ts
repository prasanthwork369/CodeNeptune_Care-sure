import {
  apiClient,
  setAccessToken,
  getAccessToken,
  setUnauthorizedHandler,
  resetRefreshStateForTests,
} from "@/src/api/client";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { tokenStorage } from "@/src/lib/storage";
import { requestQueue } from "@/src/utils/requestQueue";
import axios from "axios";

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
    set: jest.fn(),
    clear: jest.fn(),
  },
}));

describe("apiClient — Interceptors and Auth Lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAccessToken(null);
    useNetworkStore.setState({ isConnected: true });
    // isRefreshing/refreshCooldownUntil/lastRefreshFailure are module-private
    // state that would otherwise leak between tests (e.g. a cooldown set by
    // a transient-failure test bleeding into the next test's fresh 401).
    resetRefreshStateForTests();
  });

  describe("Token Accessors", () => {
    it("sets and gets the in-memory access token synchronously", () => {
      setAccessToken("test-token-123");
      expect(getAccessToken()).toBe("test-token-123");
      setAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });
  });

  describe("Request Interceptor Behavior", () => {
    const getRequestInterceptor = () => {
      const handler = (apiClient.interceptors.request as any).handlers[0];
      return handler.fulfilled;
    };

    it("attaches Bearer token header when access token is present", async () => {
      setAccessToken("secret-access-token");
      const interceptor = getRequestInterceptor();
      const config = { headers: {} as any };
      const updatedConfig = await interceptor(config);
      expect(updatedConfig.headers.Authorization).toBe(
        "Bearer secret-access-token",
      );
    });

    it("does not attach Authorization header when token is null", async () => {
      setAccessToken(null);
      const interceptor = getRequestInterceptor();
      const config = { headers: {} as any };
      const updatedConfig = await interceptor(config);
      expect(updatedConfig.headers.Authorization).toBeUndefined();
    });

    it("rejects immediately with NETWORK_OFFLINE error code when device is offline", async () => {
      useNetworkStore.setState({ isConnected: false });
      const interceptor = getRequestInterceptor();
      const config = { headers: {} as any };

      await expect(interceptor(config)).rejects.toMatchObject({
        message: "Network offline",
        code: "NETWORK_OFFLINE",
      });
    });
  });

  describe("Response 401 Refresh & Queue Interceptor Behavior", () => {
    const getResponseInterceptors = () => {
      const handler = (apiClient.interceptors.response as any).handlers[0];
      return { onFulfilled: handler.fulfilled, onRejected: handler.rejected };
    };

    it("passes through successful responses unchanged", () => {
      const { onFulfilled } = getResponseInterceptors();
      const response = { status: 200, data: { success: true } };
      expect(onFulfilled(response)).toEqual(response);
    });

    it("triggers background token refresh on 401 response and retries failed request", async () => {
      const { onRejected } = getResponseInterceptors();
      const spyPost = jest.spyOn(axios, "post").mockResolvedValueOnce({
        data: {
          data: {
            accessToken: "new-refreshed-token",
            expiresIn: 3600,
          },
        },
      });

      apiClient.defaults.adapter = jest.fn().mockResolvedValue({
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        data: { retried: true },
      }) as any;

      const err = {
        response: { status: 401 },
        config: { url: "/api/protected-route", headers: {} },
      };

      const result = await onRejected(err);
      expect(spyPost).toHaveBeenCalledWith(
        expect.stringContaining("/auth/refresh"),
        {},
        expect.any(Object),
      );
      expect(getAccessToken()).toBe("new-refreshed-token");
      expect(tokenStorage.set).toHaveBeenCalledWith("new-refreshed-token");
      expect(result.data).toEqual({ retried: true });

      spyPost.mockRestore();
    });

    it("triggers onUnauthorized handler when token refresh returns 401/403", async () => {
      const { onRejected } = getResponseInterceptors();
      const mockUnauthorizedHandler = jest.fn();
      setUnauthorizedHandler(mockUnauthorizedHandler);

      const spyPost = jest.spyOn(axios, "post").mockRejectedValueOnce({
        response: { status: 401, data: { message: "Invalid refresh token" } },
      });

      const err = {
        response: { status: 401 },
        config: { url: "/api/protected-route", headers: {} },
      };

      await expect(onRejected(err)).rejects.toBeDefined();
      expect(mockUnauthorizedHandler).toHaveBeenCalledTimes(1);
      expect(getAccessToken()).toBeNull();

      spyPost.mockRestore();
    });
  });

  describe("Refresh Failure Classification", () => {
    const getResponseInterceptors = () => {
      const handler = (apiClient.interceptors.response as any).handlers[0];
      return { onFulfilled: handler.fulfilled, onRejected: handler.rejected };
    };

    it("runs only ONE refresh for multiple simultaneous 401s, and retries every waiting request once it resolves", async () => {
      const { onRejected } = getResponseInterceptors();
      const spyPost = jest.spyOn(axios, "post").mockResolvedValueOnce({
        data: { data: { accessToken: "shared-token", expiresIn: 3600 } },
      });

      apiClient.defaults.adapter = jest.fn().mockImplementation((config) =>
        Promise.resolve({
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: { url: config.url },
        }),
      ) as any;

      const err1 = {
        response: { status: 401 },
        config: { url: "/api/protected-a", headers: {} },
      };
      const err2 = {
        response: { status: 401 },
        config: { url: "/api/protected-b", headers: {} },
      };

      const [res1, res2] = await Promise.all([
        onRejected(err1),
        onRejected(err2),
      ]);

      expect(spyPost).toHaveBeenCalledTimes(1);
      expect(res1.data).toEqual({ url: "/api/protected-a" });
      expect(res2.data).toEqual({ url: "/api/protected-b" });

      spyPost.mockRestore();
    });

    it("does not log out and classifies as a timeout — not unauthorized — when the refresh call itself times out", async () => {
      const { onRejected } = getResponseInterceptors();
      const mockUnauthorizedHandler = jest.fn();
      setUnauthorizedHandler(mockUnauthorizedHandler);
      setAccessToken("still-valid-token");

      const spyPost = jest.spyOn(axios, "post").mockRejectedValueOnce({
        isAxiosError: true,
        code: "ECONNABORTED",
        message: "timeout of 10000ms exceeded",
      });

      const err = {
        response: { status: 401 },
        config: { url: "/api/protected-route", headers: {} },
      };

      await expect(onRejected(err)).rejects.toMatchObject({ kind: "timeout" });
      expect(mockUnauthorizedHandler).not.toHaveBeenCalled();
      expect(getAccessToken()).toBe("still-valid-token");

      spyPost.mockRestore();
    });

    it("does not log out and classifies as a server error — not unauthorized — when the refresh call returns 5xx", async () => {
      const { onRejected } = getResponseInterceptors();
      const mockUnauthorizedHandler = jest.fn();
      setUnauthorizedHandler(mockUnauthorizedHandler);
      setAccessToken("still-valid-token");

      const spyPost = jest.spyOn(axios, "post").mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 503, data: {} },
      });

      const err = {
        response: { status: 401 },
        config: { url: "/api/protected-route", headers: {} },
      };

      await expect(onRejected(err)).rejects.toMatchObject({
        kind: "server",
        status: 503,
      });
      expect(mockUnauthorizedHandler).not.toHaveBeenCalled();
      expect(getAccessToken()).toBe("still-valid-token");

      spyPost.mockRestore();
    });

    it("keeps surfacing the transient failure's classification for requests made during the cooldown window, instead of a false unauthorized", async () => {
      const { onRejected } = getResponseInterceptors();
      const spyPost = jest.spyOn(axios, "post").mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 503, data: {} },
      });

      const firstErr = {
        response: { status: 401 },
        config: { url: "/api/protected-first", headers: {} },
      };
      await expect(onRejected(firstErr)).rejects.toMatchObject({
        kind: "server",
      });
      expect(spyPost).toHaveBeenCalledTimes(1);

      // A second, unrelated 401 arrives while still inside the cooldown
      // window opened by the transient failure above.
      const secondErr = {
        response: { status: 401 },
        config: { url: "/api/protected-second", headers: {} },
      };
      await expect(onRejected(secondErr)).rejects.toMatchObject({
        kind: "server",
      });
      // No second refresh attempt — the cooldown short-circuited it, and the
      // rejection still reflects the real transient reason, not "unauthorized".
      expect(spyPost).toHaveBeenCalledTimes(1);

      spyPost.mockRestore();
    });

    it("rejects every waiting concurrent request with the same classified error when the shared refresh fails transiently", async () => {
      const { onRejected } = getResponseInterceptors();
      let rejectPost!: (e: unknown) => void;
      const postPromise = new Promise((_resolve, reject) => {
        rejectPost = reject;
      });
      const spyPost = jest
        .spyOn(axios, "post")
        .mockReturnValueOnce(postPromise as any);

      const err1 = {
        response: { status: 401 },
        config: { url: "/api/a", headers: {} },
      };
      const err2 = {
        response: { status: 401 },
        config: { url: "/api/b", headers: {} },
      };

      const p1 = onRejected(err1);
      const p2 = onRejected(err2);

      rejectPost({ isAxiosError: true, code: "ECONNABORTED" });

      const [r1, r2] = await Promise.allSettled([p1, p2]);
      expect(r1.status).toBe("rejected");
      expect(r2.status).toBe("rejected");
      expect((r1 as PromiseRejectedResult).reason).toMatchObject({
        kind: "timeout",
      });
      expect((r2 as PromiseRejectedResult).reason).toMatchObject({
        kind: "timeout",
      });

      spyPost.mockRestore();
    });
  });

  describe("Offline Queueable Writes", () => {
    const getRequestInterceptor = () => {
      const handler = (apiClient.interceptors.request as any).handlers[0];
      return handler.fulfilled;
    };
    const getResponseInterceptors = () => {
      const handler = (apiClient.interceptors.response as any).handlers[0];
      return { onFulfilled: handler.fulfilled, onRejected: handler.rejected };
    };

    beforeEach(async () => {
      await requestQueue.clear();
      useNetworkStore.setState({ isConnected: false });
    });

    it("tags a safe write (notification mark-read) as queueable instead of hard-rejecting when offline", async () => {
      const interceptor = getRequestInterceptor();
      const config = {
        method: "patch",
        url: "/api/v1/customers/notifications/abc123/read",
        headers: {},
      };

      await expect(interceptor(config)).rejects.toMatchObject({
        code: "NETWORK_OFFLINE_QUEUEABLE",
        config,
      });
    });

    it("does NOT queue search-history writes offline — hard-rejects instead so search terms are never persisted to disk", async () => {
      const interceptor = getRequestInterceptor();
      const record = {
        method: "post",
        url: "/api/v1/customers/search-history",
        data: { query: "amoxicillin 500mg" },
        headers: {},
      };
      const deleteItem = {
        method: "delete",
        url: "/api/v1/customers/search-history/xyz",
        headers: {},
      };

      await expect(interceptor(record)).rejects.toMatchObject({
        message: "Network offline",
        code: "NETWORK_OFFLINE",
      });
      await expect(interceptor(deleteItem)).rejects.toMatchObject({
        message: "Network offline",
        code: "NETWORK_OFFLINE",
      });
      expect(requestQueue.length).toBe(0);
    });

    it("still hard-rejects unsafe mutations (order creation, cart, checkout) when offline", async () => {
      const interceptor = getRequestInterceptor();
      const unsafeConfigs = [
        { method: "post", url: "/api/v1/orders", headers: {} },
        { method: "post", url: "/api/v1/customers/cart/items", headers: {} },
        { method: "post", url: "/api/v1/customers/wallet/topup", headers: {} },
      ];

      for (const config of unsafeConfigs) {
        await expect(interceptor(config)).rejects.toMatchObject({
          message: "Network offline",
          code: "NETWORK_OFFLINE",
        });
      }
      expect(requestQueue.length).toBe(0);
    });

    it("hands a queueable rejection to requestQueue and replays it automatically on reconnect", async () => {
      const { onRejected } = getResponseInterceptors();
      const config = {
        method: "delete",
        url: "/api/v1/customers/search-history/xyz",
        headers: {},
      };

      const pending = onRejected({
        code: "NETWORK_OFFLINE_QUEUEABLE",
        config,
      });
      expect(requestQueue.length).toBe(1);

      // Simulates network.ts's reconnect handler calling requestQueue.process(apiClient).
      const mockAxiosInstance = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: { success: true } });
      await requestQueue.process(mockAxiosInstance);

      await expect(pending).resolves.toEqual({
        status: 200,
        data: { success: true },
      });
      expect(mockAxiosInstance).toHaveBeenCalledWith(config);
      expect(requestQueue.length).toBe(0);
    });

    it("folds a duplicate queued write (rapid double-tap) into a single replay", async () => {
      const { onRejected } = getResponseInterceptors();
      const config = {
        method: "patch",
        url: "/api/v1/customers/notifications/abc123/dismiss",
        headers: {},
      };

      const p1 = onRejected({
        code: "NETWORK_OFFLINE_QUEUEABLE",
        config: { ...config },
      });
      const p2 = onRejected({
        code: "NETWORK_OFFLINE_QUEUEABLE",
        config: { ...config },
      });
      expect(requestQueue.length).toBe(1);

      const mockAxiosInstance = jest
        .fn()
        .mockResolvedValueOnce({ status: 200, data: {} });
      await requestQueue.process(mockAxiosInstance);

      await expect(p1).resolves.toEqual({ status: 200, data: {} });
      await expect(p2).resolves.toEqual({ status: 200, data: {} });
      expect(mockAxiosInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe("Offline Queue Cleared On Logout", () => {
    // useAuthStore.logout() is the single centralized place that clears the
    // offline queue — exercised end-to-end (both the forced unauthorized
    // path and manual logout converge on it) in authStore.test.ts. This just
    // sanity-checks requestQueue.clear() empties a queued offline request.
    it("requestQueue.clear() empties a queued offline request", async () => {
      await requestQueue.clear();
      useNetworkStore.setState({ isConnected: false });
      const { onRejected } = (() => {
        const handler = (apiClient.interceptors.response as any).handlers[0];
        return { onRejected: handler.rejected };
      })();

      onRejected({
        code: "NETWORK_OFFLINE_QUEUEABLE",
        config: {
          method: "patch",
          url: "/api/v1/customers/notifications/abc123/read",
          headers: {},
        },
      }).catch(() => {});
      expect(requestQueue.length).toBe(1);

      await requestQueue.clear();

      expect(requestQueue.length).toBe(0);
    });
  });
});
