import { tokenStorage } from "@/src/lib/storage";
import { isOffline } from "@/src/utils/offline/networkState";
import { reportOffline } from "@/src/utils/offline/networkFeedback";

import { logger } from "@/src/utils/logger";
import { requestQueue } from "@/src/utils/requestQueue";
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT } from "@/src/utils/urls";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { asError, toAppError } from "./errors";

// Checks if a request is safe to queue offline (e.g. read notifications, search history)
const isQueueableRequest = (config: AxiosRequestConfig): boolean => {
  const method = (config.method ?? "").toLowerCase();
  const url = config.url ?? "";

  if (method === "patch") {
    return (
      url.startsWith("/api/v1/customers/notifications/") &&
      (url.endsWith("/read") || url.endsWith("/dismiss"))
    );
  }
  if (method === "post") {
    return url === API_ENDPOINTS.SEARCH_HISTORY;
  }
  if (method === "delete") {
    return (
      url === API_ENDPOINTS.SEARCH_HISTORY ||
      url.startsWith(`${API_ENDPOINTS.SEARCH_HISTORY}/`)
    );
  }
  return false;
};

// In-memory access token to avoid async storage lookup on every request
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

// Backoff cooldown if token refresh fails due to network/server errors
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

// Request interceptor: attaches auth header and checks offline status
apiClient.interceptors.request.use((config) => {
  // if (__DEV__) {
  //   if (config.data !== undefined) {
  //     logger.debug(`[apiClient Outgoing] ${config.method?.toUpperCase()} ${config.url}`, JSON.stringify(config.data, null, 2));
  //   } else {
  //     logger.debug(`[apiClient Outgoing] ${config.method?.toUpperCase()} ${config.url}`);
  //   }
  // }
  if (isOffline()) {
    if (isQueueableRequest(config)) {
      // Queue safe offline requests, reject others immediately
      return Promise.reject(
        Object.assign(new Error("Network offline — queued for replay"), {
          code: "NETWORK_OFFLINE_QUEUEABLE",
          config,
        }),
      );
    }
    reportOffline();
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
    // Queue safe offline request when connection drops
    if (err.code === "NETWORK_OFFLINE_QUEUEABLE" && err.config) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        requestQueue.add(err.config, resolve, reject);
      });
    }

    // Reject immediately if connection lost during transaction
    const isNetworkError =
      !err.response &&
      err.code !== "ECONNABORTED" &&
      err.code !== "NETWORK_OFFLINE";
    if (isNetworkError && isOffline()) {
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
        // Logout only on 401/403 (expired session); keep logged in on 5xx server errors
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
