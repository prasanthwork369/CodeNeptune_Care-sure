import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';

export interface ApiSearchRecommendation {
    id: string;
    productId: string;
    productType: number;
    sourceType: number;
    name: string;
    slug: string;
    dosageForm: string;
    packSize: string;
    unit: string;
    price: string;
    mrp: string;
    discountPercentage: number;
    thumbnailUrl: string;
}

export interface ApiSearchMedicine {
    id: string;
    productId: string;
    productType: number;
    sourceType: number;
    name: string;
    slug: string;
    dosageForm: string;
    packSize: string;
    unit: string;
    price: string;
    mrp: string;
    discountPercentage: number;
    requiresPrescription?: boolean;
    thumbnailUrl: string;
    recommendation: ApiSearchRecommendation | null;
    brand?: {
        id: string;
        name: string;
        slug: string;
    };
    category?: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface ApiSearchResponse {
    data: ApiSearchMedicine[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ApiSearchHistoryItem {
    id: string;
    query: string;
    productId?: string;
    createdAt: string;
}

export interface ApiTrendingItem {
    query: string;
    count: number;
}

export const searchApi = {
    searchMedicines: async (query: string, page = 1, limit = 10): Promise<ApiSearchResponse> => {
        const response = await apiClient.get(API_ENDPOINTS.SEARCH_MEDICINES, {
            params: { query, page, limit },
        });
        return response.data;
    },

    getSuggestions: async (query: string, limit = 8): Promise<string[]> => {
        const response = await apiClient.get(API_ENDPOINTS.SEARCH_SUGGESTIONS, {
            params: { query, limit },
        });
        return response.data?.data ?? [];
    },

    getProductDetail: async (productId: string): Promise<any> => {
        const response = await apiClient.get(API_ENDPOINTS.PRODUCT_BY_ID(productId));
        return response.data?.data ?? response.data;
    },

    getHistory: async (limit = 10, offset = 0): Promise<ApiSearchHistoryItem[]> => {
        const response = await apiClient.get(API_ENDPOINTS.SEARCH_HISTORY, {
            params: { limit, offset },
        });
        return response.data?.data ?? [];
    },

    recordHistory: async (query: string, productId?: string): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.SEARCH_HISTORY, { query, productId });
    },

    clearHistory: async (): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.SEARCH_HISTORY);
    },

    deleteHistoryItem: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.SEARCH_HISTORY_ITEM(id));
    },

    getTrending: async (limit = 6): Promise<ApiTrendingItem[]> => {
        const response = await apiClient.get(API_ENDPOINTS.SEARCH_TRENDING, {
            params: { limit },
        });
        return response.data?.data ?? [];
    },
};
