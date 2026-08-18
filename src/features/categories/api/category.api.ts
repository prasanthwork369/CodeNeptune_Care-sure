import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type {
  ApiCategoryFamily,
  ApiCategoryProductsResponse,
  ApiFeaturedSubcategory,
} from "../types/api.types";

export const categoryApi = {
  getFeaturedSubcategories: async (
    limit = 4,
  ): Promise<ApiFeaturedSubcategory[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.CATEGORY_FEATURED_SUBCATEGORIES,
      {
        params: { limit },
      },
    );
    return response.data?.data ?? [];
  },

  getCategoryFamilyMap: async (): Promise<ApiCategoryFamily[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORY_FAMILY_MAP);
    return response.data?.data ?? [];
  },

  getCategoryProducts: async (params: {
    categorySlug: string;
    subCategorySlug?: string;
    childCategorySlug?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiCategoryProductsResponse> => {
    const { categorySlug, ...query } = params;
    const response = await apiClient.get(
      API_ENDPOINTS.CATEGORY_PRODUCTS(categorySlug),
      { params: query },
    );
    // Response returns items at root level (not nested in data.data)
    return response.data ?? { items: [], total: 0, totalPages: 0 };
  },
};
