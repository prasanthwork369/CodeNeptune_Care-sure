import { authApi } from '../api/auth.api';
import { profileApi } from '../api/profile.api';
import { tokenStorage } from '../lib/storage';
import { useAuthStore } from '../store/authStore';

export const authService = {
    requestOtp: async (phone: string) => {
        return await authApi.requestOtp(phone);
    },
    verifyOtp: async (phone: string, otp: string) => {
        const data = await authApi.verifyOtp(phone, otp);
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
            if (__DEV__) console.error('Failed to load profile after login:', error);
        }

        return data;
    },
    logout: async () => {
        try {
            await authApi.logout();
        } finally {
            await useAuthStore.getState().logout();
        }
    },
};
