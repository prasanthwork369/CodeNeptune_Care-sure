import { ApiAdditionalDataMap } from "../types/productSection";
import { API_ENDPOINTS } from "../utils/urls";
import { apiClient } from "./client";

export interface ApiBrand {
  id: string;
  name: string;
  slug: string;
}

export interface ApiMedicineCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiFeaturedMedicine {
  id: string;
  productId: string;
  name: string;
  slug: string;
  dosageForm: string;
  packSize: string;
  unit?: string;
  price: string;
  discountPercentage: string;
  requiresPrescription: boolean;
  isFeatured: boolean;
  thumbnailUrl: string;
  status: number;
  brand: ApiBrand;
  category: ApiMedicineCategory;
  // Present when the backend expands variants on featured cards. Used only to
  // add variant[0] to the cart (the card still displays the base price).
  medicine_variants?: MedicineVariant[];
}

export interface ApiProductSalt {
  id: string;
  name: string;
  unit: string;
  amount: number;
  genericName: string;
}

export interface ApiProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface MedicineVariant {
  id: string;
  sku: string | null;
  unit: string;
  mrp: number; // strikethrough MRP; `price` below is the already-discounted selling price
  price: number;
  status: number;
  packSize: string;
  quantity: number;
  medicineId: string;
  discountPercentage: number;
}

export interface ApiProductDetail {
  id: string;
  productId: string;
  name: string;
  slug: string;
  dosageForm: string;
  packSize: string;
  price: string;
  discountPercentage: string;
  mrp: string | null;
  requiresPrescription: boolean;
  thumbnailUrl: string;
  description: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  sourceType: number;
  unit: string;
  disclaimer: string | null;
  packagingDetail: string | null;
  countryOfOrigin: string | null;
  safetyInteractions: Record<string, string> | null;
  productHighlights: string | null;
  keyIngredients: string | null;
  keyBenefits: string | null;
  // Backend-driven sections keyed by name; each carries its own design_type and sort_order.
  additionalData: ApiAdditionalDataMap | null;
  brand: ApiBrand;
  category: ApiMedicineCategory;
  manufacturer: { id: string; name: string; slug: string } | null;
  marketer: { id: string; name: string; slug: string } | null;
  salts: ApiProductSalt[];
  images: ApiProductImage[];
  medicine_variants: MedicineVariant[];
  recommendation: {
    id: string;
    name: string;
    slug: string;
    productId: string;
    dosageForm: string;
    packSize: string;
    unit: string;
    price: string;
    mrp?: string;
    discountPercentage: number;
    manufacturer: string;
    thumbnailUrl: string;
  } | null;
}

export const medicineApi = {
  // The endpoint only takes `limit` — it has no paging, so a full listing just
  // asks for a larger page. Signature matches the web client.
  getFeaturedCards: async (limit = 10): Promise<ApiFeaturedMedicine[]> => {
    const response = await apiClient.get(
      API_ENDPOINTS.MEDICINES_FEATURED_CARDS,
      {
        params: { limit },
      },
    );
    return response.data?.data ?? [];
  },
  getProductById: async (productId: string): Promise<ApiProductDetail> => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.PRODUCT_BY_ID(productId),
      );
      return response.data.data;
    } catch {
      const response = await apiClient.get(`/api/v1/medicines/${productId}`);
      return response.data.data;
    }
  },
  getProductByCatalogId: async (
    catalogId: string,
  ): Promise<ApiProductDetail> => {
    // catalogId is the alphanumeric productId (e.g. "CS-BDSMYG"), not the UUID id field
    const response = await apiClient.get(
      API_ENDPOINTS.PRODUCT_BY_ID(catalogId),
    );
    return response.data.data;
  },
};
