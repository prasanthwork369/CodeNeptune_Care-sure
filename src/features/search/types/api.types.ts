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
  packagingDetail?: string | null;
  manufacturer?: string | null;
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
  packagingDetail?: string | null;
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

export interface SubstituteRequestResponse {
  id: string;
  customerId: string;
  medicineId: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}
