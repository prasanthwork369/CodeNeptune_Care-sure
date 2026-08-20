// Envelope every additionalData entry arrives in, whatever its key.
export interface ApiProductSection {
  data?: unknown;
  design_type?: number;
  title?: string;
  sort_order?: number;
}

export type ApiAdditionalDataMap = Record<string, ApiProductSection | null>;

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

export interface ApiProductSalt {
  id: string;
  name: string;
  unit: string;
  amount: number;
  genericName: string;
}

export interface ApiProductImage {
  id: string;
  imageUrl: string;
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
  medicine_variants?: MedicineVariant[];
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
  is_returnable?: boolean;
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
    manufacturer: string | { name: string; [key: string]: any } | null;
    brand?: { name: string; [key: string]: any } | null;
    thumbnailUrl: string;
  } | null;
}
