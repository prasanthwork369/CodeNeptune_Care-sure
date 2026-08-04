import { tokenStorage } from "@/src/lib/storage";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT } from "@/src/utils/urls";
import axios, { AxiosInstance } from "axios";
import { asError, toAppError } from "./errors";
import { logger } from "@/src/utils/logger";

// In-memory token — mirrors window.__ACCESS_TOKEN__ from web client
// Synchronous access avoids async race conditions in the request interceptor
let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

let isRefreshing = false;
let failedQueue: {
  resolve: (v: string) => void;
  reject: (e: unknown) => void;
}[] = [];

// After a non-auth refresh failure (5xx/network), back off for a short
// window instead of re-attempting refresh on every subsequent 401 — avoids
// hammering a struggling refresh endpoint with a burst of retries.
const REFRESH_COOLDOWN_MS = 5000;
let refreshCooldownUntil = 0;

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "x-panel-id": "customer",
  },
});

// Synchronous request interceptor — reads from in-memory token (no async)
apiClient.interceptors.request.use((config) => {
  // if (__DEV__) {
  //   if (config.data !== undefined) {
  //     logger.debug(`[apiClient Outgoing] ${config.method?.toUpperCase()} ${config.url}`, JSON.stringify(config.data, null, 2));
  //   } else {
  //     logger.debug(`[apiClient Outgoing] ${config.method?.toUpperCase()} ${config.url}`);
  //   }
  // }
  const { isConnected } = useNetworkStore.getState();
  if (isConnected === false) {
    useNetworkStore.getState().showOfflineAlert();
    return Promise.reject(
      Object.assign(new Error("Network offline"), {
        code: "NETWORK_OFFLINE",
      }),
    );
  }
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// 401 response interceptor — refresh and retry
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const isNetworkError =
      !err.response &&
      err.code !== "ECONNABORTED" &&
      err.code !== "NETWORK_OFFLINE";
    const { isConnected } = useNetworkStore.getState();
    if (isNetworkError && isConnected === false) {
      useNetworkStore.getState().showOfflineAlert();
      return Promise.reject(
        Object.assign(new Error("Network offline"), {
          code: "NETWORK_OFFLINE",
        }),
      );
    }

    const original = err.config;

    const isAuthPath =
      original?.url?.includes("auth/refresh") ||
      original?.url?.includes("auth/logout");

    if (err.response?.status === 401 && !original?._retry && !isAuthPath) {
      if (Date.now() < refreshCooldownUntil) {
        return Promise.reject(toAppError(err));
      }

      if (__DEV__)
        logger.debug(
          "[apiClient] 401 detected. Attempting background refresh...",
        );

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          })
          .catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH_REFRESH}`,
          {},
          {
            withCredentials: true,
            headers: { "x-panel-id": "customer" },
          },
        );

        const newToken = data.data.accessToken;
        const expiresIn = data.data.expiresIn;

        if (__DEV__) logger.debug("[apiClient] Background refresh SUCCESS");
        refreshCooldownUntil = 0;

        // Update in-memory token + persist to SecureStore
        _accessToken = newToken;
        await tokenStorage.set(newToken);
        if (expiresIn) {
          await tokenStorage.setExpiresAt(Date.now() + expiresIn * 1000);
        }

        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (e) {
        if (__DEV__) console.error("[apiClient] Background refresh FAILED:", e);
        processQueue(e, null);
        // Only force logout if the refresh itself returned 401/403 (invalid/expired refresh token)
        // A 5xx server error should not log the user out
        const refreshStatus = asError(e).response?.status;
        if (refreshStatus === 401 || refreshStatus === 403) {
          _accessToken = null;
          onUnauthorized?.();
        } else {
          refreshCooldownUntil = Date.now() + REFRESH_COOLDOWN_MS;
        }
        return Promise.reject(toAppError(err));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(toAppError(err));
  },
);
