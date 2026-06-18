import { apiClient } from '@/src/api/client';
import { PRESCRIPTION_CATEGORY } from '@/src/constants/prescription-category';
import { ApiPrescription } from '@/src/types/prescription';
import { API_ENDPOINTS } from '@/src/utils/urls';

export const prescriptionService = {
    upload: async (data: {
        imageUrls: string[];
        category?: number;
        orderId?: string;
        doctorName?: string;
        issuedDate?: string;
        notes?: string;
    }) => {
        const payload = { ...data, category: data.category ?? PRESCRIPTION_CATEGORY.ORDER };
        try {
            const response = await apiClient.post(API_ENDPOINTS.PRESCRIPTIONS, payload);
            return { success: true, data: response.data.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to submit prescription',
            };
        }
    },

    getById: async (id: string): Promise<{ success: true; data: ApiPrescription } | { success: false; error: string }> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PRESCRIPTION_BY_ID(id));
            return { success: true, data: response.data.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch prescription',
            };
        }
    },

    list: async (params?: {
        page?: number;
        limit?: number;
        status?: number;
        excludeStatus?: number;
        orderId?: string;
        category?: number;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{ success: true; data: ApiPrescription[] } | { success: false; error: string }> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PRESCRIPTIONS, { params });
            return { success: true, data: response.data.data };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to fetch prescriptions',
            };
        }
    },

    dismiss: async (
        id: string
    ): Promise<{ success: true; data: any } | { success: false; error: string }> => {
        try {
            const response = await apiClient.patch(`/api/v1/prescriptions/${id}/dismiss`);
            return {
                success: true,
                data: response.data?.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to dismiss prescription',
            };
        }
    },
};
