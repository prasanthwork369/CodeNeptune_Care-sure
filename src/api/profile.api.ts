import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';

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
        const response = await apiClient.patch(API_ENDPOINTS.CUSTOMER_PROFILE, payload);
        return response.data?.data ?? profileApi.getProfile();
    },
};
