import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "caresure.auth.token";
// Refresh tokens are no longer written here — the 401 refresh flow uses the
// httpOnly cookie (see api/client.ts, withCredentials: true). This key only
// still exists so clearRefreshToken() can delete any stray value a
// pre-cleanup install may have persisted.
const AUTH_REFRESH_TOKEN_KEY = "caresure.auth.refreshToken";
const AUTH_EXPIRES_AT_KEY = "caresure.auth.expiresAt";

export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch {}
  },
  async getExpiresAt(): Promise<number | null> {
    try {
      const val = await SecureStore.getItemAsync(AUTH_EXPIRES_AT_KEY);
      return val ? Number(val) : null;
    } catch {
      return null;
    }
  },
  async setExpiresAt(expiresAt: number): Promise<void> {
    await SecureStore.setItemAsync(AUTH_EXPIRES_AT_KEY, String(expiresAt));
  },
  async clearExpiresAt(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_EXPIRES_AT_KEY);
    } catch {}
  },
  async clearRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY);
    } catch {}
  },
};

const GUEST_MODE_KEY = "caresure.auth.isGuest";

export const guestStorage = {
  async get(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(GUEST_MODE_KEY)) === "true";
    } catch {
      return false;
    }
  },
  async set(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, value ? "true" : "false");
    } catch {}
  },
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
    } catch {}
  },
};
