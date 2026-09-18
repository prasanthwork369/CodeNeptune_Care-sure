/**
 * Secure storage utility
 * Encrypts sensitive data using SecureStore
 * Falls back to AsyncStorage for non-sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum StorageKey {
  // Sensitive - use SecureStore
  AUTH_TOKEN = 'auth_token',
  REFRESH_TOKEN = 'refresh_token',
  USER_DATA = 'user_data',
  PAYMENT_METHOD = 'payment_method',

  // Non-sensitive - use AsyncStorage
  LANGUAGE = 'language',
  THEME = 'theme',
  LAST_LOCATION = 'last_location',
}

const SECURE_KEYS = new Set<string>([
  StorageKey.AUTH_TOKEN,
  StorageKey.REFRESH_TOKEN,
  StorageKey.USER_DATA,
  StorageKey.PAYMENT_METHOD,
]);

/**
 * Store data securely
 * Sensitive keys use SecureStore (encrypted)
 * Other keys use AsyncStorage
 */
export async function setSecureItem(
  key: StorageKey | string,
  value: string,
): Promise<void> {
  try {
    if (SECURE_KEYS.has(key)) {
      // Sensitive data - encrypt with SecureStore
      await SecureStore.setItemAsync(key, value);
    } else {
      // Non-sensitive data - use AsyncStorage
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error(`[SecureStorage] Failed to set ${key}:`, error);
    throw error;
  }
}

/**
 * Retrieve data securely
 */
export async function getSecureItem(
  key: StorageKey | string,
): Promise<string | null> {
  try {
    if (SECURE_KEYS.has(key)) {
      // Sensitive data - from encrypted SecureStore
      return await SecureStore.getItemAsync(key);
    } else {
      // Non-sensitive data - from AsyncStorage
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.error(`[SecureStorage] Failed to get ${key}:`, error);
    return null;
  }
}

/**
 * Remove data from storage
 */
export async function removeSecureItem(
  key: StorageKey | string,
): Promise<void> {
  try {
    if (SECURE_KEYS.has(key)) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`[SecureStorage] Failed to remove ${key}:`, error);
  }
}

/**
 * Clear all sensitive data (for logout)
 */
export async function clearSensitiveData(): Promise<void> {
  try {
    // Clear all secure storage
    for (const key of SECURE_KEYS) {
      await removeSecureItem(key);
    }
  } catch (error) {
    console.error('[SecureStorage] Failed to clear sensitive data:', error);
  }
}

/**
 * Helper: Store JSON safely
 */
export async function setSecureJSON<T extends Record<string, any>>(
  key: StorageKey | string,
  value: T,
): Promise<void> {
  const jsonString = JSON.stringify(value);
  await setSecureItem(key, jsonString);
}

/**
 * Helper: Get JSON safely
 */
export async function getSecureJSON<T = Record<string, any>>(
  key: StorageKey | string,
): Promise<T | null> {
  try {
    const jsonString = await getSecureItem(key);
    if (!jsonString) return null;
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error(`[SecureStorage] Failed to parse JSON for ${key}:`, error);
    return null;
  }
}
