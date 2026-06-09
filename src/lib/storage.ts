import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'caresure.auth.token';
const AUTH_REFRESH_TOKEN_KEY = 'caresure.auth.refreshToken';
const AUTH_EXPIRES_AT_KEY = 'caresure.auth.expiresAt';
const AVATAR_URI_KEY = 'caresure.profile.avatarUri';

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
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_REFRESH_TOKEN_KEY, token);
  },
  async clearRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_REFRESH_TOKEN_KEY);
    } catch {}
  },
  async clearAvatarUri(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AVATAR_URI_KEY);
    } catch {}
  },
};
