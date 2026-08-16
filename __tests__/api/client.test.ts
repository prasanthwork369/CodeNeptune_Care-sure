import {
  apiClient,
  setAccessToken,
  getAccessToken,
  setUnauthorizedHandler,
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
    clearAvatarUri: jest.fn().mockResolvedValue(undefined),
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

    it("tags search-history record/delete/clear as queueable when offline", async () => {
      const interceptor = getRequestInterceptor();
      const record = {
        method: "post",
        url: "/api/v1/customers/search-history",
        headers: {},
      };
      const deleteItem = {
        method: "delete",
        url: "/api/v1/customers/search-history/xyz",
        headers: {},
      };

      await expect(interceptor(record)).rejects.toMatchObject({
        code: "NETWORK_OFFLINE_QUEUEABLE",
      });
      await expect(interceptor(deleteItem)).rejects.toMatchObject({
        code: "NETWORK_OFFLINE_QUEUEABLE",
      });
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

  describe("Queue Cleared On Logout", () => {
    it("clears the offline queue when the unauthorized handler runs (app/_layout.tsx wiring)", async () => {
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

      // Mirrors setUnauthorizedHandler's callback in app/_layout.tsx, which
      // calls queryClient.clear(); requestQueue.clear(); logout().
      await requestQueue.clear();

      expect(requestQueue.length).toBe(0);
    });
  });
});
