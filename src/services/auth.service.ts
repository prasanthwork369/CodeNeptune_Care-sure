import { authApi } from "../api/auth.api";
import { CustomerProfile, profileApi } from "../api/profile.api";
import { setAccessToken } from "../api/client";
import { tokenStorage } from "../lib/storage";
import { useAuthStore } from "../store/authStore";
import { messagingService as notificationService } from "./firebase";
import { getDeviceInfo } from "../lib/deviceInfo";

export const authService = {
  requestOtp: async (phone: string) => {
    return await authApi.requestOtp(phone);
  },
  verifyOtp: async (phone: string, otp: string) => {
    // Retrieve the unique hardware deviceId (always mandatory for backend verify-otp schema validation)
    const { deviceId } = await getDeviceInfo();
    if (__DEV__) console.log("[VerifyOtp] deviceId:", deviceId);

    const data = await authApi.verifyOtp(phone, otp, deviceId);
    const { accessToken, refreshToken, expiresIn } = data.data;

    // Flipping `isAuthenticated` early starts useProfile()'s fetch, and the
    // backend clears isFirstTimeLogin on whichever profile fetch lands first.
    setAccessToken(accessToken);

    let profile: CustomerProfile | null = null;
    try {
      profile = await profileApi.getProfile();
    } catch (error) {
      if (__DEV__) console.error("Failed to load profile after login:", error);
    }

    await useAuthStore.getState().login(accessToken, expiresIn);
    if (profile) useAuthStore.getState().setUser(profile);
    if (refreshToken) {
      await tokenStorage.setRefreshToken(refreshToken);
    }

    return data;
  },
  logout: async () => {
    try {
      // Unregister the push token while the auth header is still valid —
      // deactivates it server-side so this device stops getting pushes
      // addressed to an account it's no longer signed into.
      await Promise.allSettled([
        authApi.logout(),
        notificationService.unregister(),
      ]);
    } finally {
      await useAuthStore.getState().logout();
    }
  },
  deleteAccount: async (reason?: string) => {
    // Delete the account first — if this throws, we keep the user signed in
    // and surface the error rather than clearing their session.
    const result = await profileApi.deleteAccount(reason);
    if (result?.success === false) {
      throw new Error("Account deletion failed. Please try again.");
    }
    // Best-effort push cleanup, then clear all local auth/user state so the
    // app redirects back to login (same teardown as logout).
    await notificationService.unregister().catch(() => {});
    await useAuthStore.getState().logout();
    return result;
  },
};
