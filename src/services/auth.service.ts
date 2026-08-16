import { authApi } from "../api/auth.api";
import { profileApi } from "../api/profile.api";
import { setAccessToken } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { messagingService as notificationService } from "./firebase";
import { getDeviceInfo } from "../lib/deviceInfo";
import { logger } from "@/src/utils/logger";

export const authService = {
  requestOtp: async (phone: string) => {
    return await authApi.requestOtp(phone);
  },
  verifyOtp: async (phone: string, otp: string) => {
    // Retrieve the unique hardware deviceId (always mandatory for backend verify-otp schema validation)
    const { deviceId } = await getDeviceInfo();
    if (__DEV__) logger.debug("[VerifyOtp] deviceId:", deviceId);

    const data = await authApi.verifyOtp(phone, otp, deviceId);
    const { accessToken, expiresIn } = data.data;

    // Flipping `isAuthenticated` early starts useProfile()'s fetch, and the
    // backend clears isFirstTimeLogin on whichever profile fetch lands first.
    setAccessToken(accessToken);

    await useAuthStore.getState().login(accessToken, expiresIn);

    // The profile fetch used to block navigation here, duplicating the fetch
    // useProfile() (mounted in the tabs layout) already makes once Home is
    // reached. It only needs to land eventually: SignupBonusPopup is the one
    // consumer of authStore's `user`, and it already waits for Home plus the
    // permission flow before reading it, so fetching it in the background
    // after navigation has already started is equivalent, just not blocking.
    void profileApi
      .getProfile()
      .then((profile) => useAuthStore.getState().setUser(profile))
      .catch((error) => {
        if (__DEV__)
          console.error("Failed to load profile after login:", error);
      });

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
