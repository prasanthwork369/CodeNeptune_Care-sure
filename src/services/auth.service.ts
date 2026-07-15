import { authApi } from "../api/auth.api";
import { profileApi } from "../api/profile.api";
import { tokenStorage } from "../lib/storage";
import { useAuthStore } from "../store/authStore";
import { notificationService } from "./notifications/notification.service";
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

    // 1. Save tokens and set basic auth state
    await useAuthStore.getState().login(accessToken, expiresIn);
    if (refreshToken) {
      await tokenStorage.setRefreshToken(refreshToken);
    }

    // 2. Fetch and store full profile immediately (Matching Warehouse Flow)
    try {
      const profile = await profileApi.getProfile();
      useAuthStore.getState().setUser(profile);
    } catch (error) {
      if (__DEV__) console.error("Failed to load profile after login:", error);
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
