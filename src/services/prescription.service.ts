import { apiClient } from '@/src/api/client';
import { PRESCRIPTION_CATEGORY } from '@/src/constants/prescription-category';
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

    getById: async (id: string) => {
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
    }) => {
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
};
