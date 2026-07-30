import {
  apiClient,
  setAccessToken,
  getAccessToken,
  setUnauthorizedHandler,
} from "@/src/api/client";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { tokenStorage } from "@/src/lib/storage";
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
});
