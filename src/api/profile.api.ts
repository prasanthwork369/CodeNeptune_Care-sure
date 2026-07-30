import { API_ENDPOINTS } from '../utils/urls';
import { sanitize, sanitizeAsciiFields } from '../utils/validation';
import { apiClient } from './client';

// iOS paste and dictation bypass the Android input filter, so strip before the payload leaves.
const PROFILE_TEXT_FIELDS = ['firstName', 'lastName', 'email'] as const;

export interface CustomerProfile {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  isFirstTimeLogin?: boolean;
  isCorporateUser?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
    avatarUrl?: string;
}

export const profileApi = {
    getProfile: async (): Promise<CustomerProfile> => {
        const response = await apiClient.get(API_ENDPOINTS.CUSTOMER_PROFILE);
        return response.data.data;
    },
    updateProfile: async (payload: UpdateProfilePayload): Promise<CustomerProfile> => {
        const response = await apiClient.patch(
            API_ENDPOINTS.CUSTOMER_PROFILE,
            sanitizeAsciiFields(payload, PROFILE_TEXT_FIELDS),
        );
        return response.data?.data ?? profileApi.getProfile();
    },
    // Sends a verification OTP to the given email address.
    requestEmailVerify: async (email: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.CUSTOMER_EMAIL_REQUEST_VERIFY, { email });
    },
    // Confirms the OTP the user received by email.
    verifyEmail: async (otp: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.CUSTOMER_EMAIL_VERIFY, { otp });
    },
    // Permanently deletes the logged-in customer's account. reason is optional.
    deleteAccount: async (reason?: string): Promise<{ success: boolean }> => {
        const response = await apiClient.delete(API_ENDPOINTS.CUSTOMER_PROFILE, {
            data: reason ? { reason: sanitize.ascii(reason) } : undefined,
        });
        return response.data?.data ?? response.data;
    },
};
