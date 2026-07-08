import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';

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

interface AdditionalDataPointSection {
    color?: string;
    title?: string;
    subtitle?: string;
    points: string[];
}

interface AdditionalDataItemSection {
    color?: string;
    title?: string;
    subtitle?: string;
    items: { title: string; description: string }[];
}

interface AdditionalDataGroupSection {
    color?: string;
    title?: string;
    subtitle?: string;
    groups: { title: string; points: string[] }[];
}

export interface ApiAdditionalData {
    benefits?: AdditionalDataItemSection;
    sideEffects?: AdditionalDataGroupSection;
    howToUse?: AdditionalDataItemSection;
    storage?: AdditionalDataPointSection;
    dailyDose?: AdditionalDataPointSection;
    quickTips?: AdditionalDataPointSection;
    directionsForUse?: AdditionalDataPointSection;
    interactions?: AdditionalDataPointSection;
    drugFoodInteraction?: AdditionalDataPointSection;
    drugOtherInteractions?: AdditionalDataPointSection;
    drugDiseaseInteractions?: AdditionalDataPointSection;
    faqs?: { question: string; answer: string }[];
    overdose?: string;
    forgottenDose?: string;
    disclaimer?: string;
    shortDescription?: string;
    longDescription?: string;
    factBox?: {
        habitForming?: string;
        chemicalClass?: string;
        therapeuticClass?: string;
        therapeuticClassDetail?: string;
    };
    safetyGuidance?: Array<{
        id: string;
        image: string;
        label: string;
        title: string;
        sortOrder: number;
        description: string;
    }>;
    writtenBy?: string;
    reviewedBy?: string;
    references?: string[];
}

export interface ApiMobileAdditionalData {
    safetyGuidance?: Array<{
        id: string;
        image: string;
        label: string;
        title: string;
        sortOrder: number;
        description: string;
    }> | null;
    howToUse?: string | null;
    benefits?: string | null;
    faqs?: { question: string; answer: string }[] | null;
    factBox?: {
        habitForming?: string;
        chemicalClass?: string;
        therapeuticClass?: string;
        therapeuticClassDetail?: string;
    } | null;
    mobHowItWorks?: string | Array<{ image: string; label: string; title: string; description: string }> | null;
    quickTips?: string | null;
    storage?: string | null;
    interactions?: string | null;
    dailyDose?: string | null;
    references?: string[] | null;
    shortDescription?: string | null;
    longDescription?: string | null;
    sideEffects?: string | null;
    directionsForUse?: string | null;
    drugFoodInteraction?: string | null;
    drugDiseaseInteractions?: string | null;
    overdose?: string | null;
    forgottenDose?: string | null;
    disclaimer?: string | null;
    mobBenefits?: string | null;
    mobSideEffects?: string | null;
    mobHowToUse?: string | null;
    mobWhatIfIForgotToTake?: string | null;
    mobManufacturerAddress?: string | null;
}

export interface MedicineVariant {
    id: string;
    sku: string | null;
    unit: string;
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
    additionalData: ApiAdditionalData | null;
    mobileAdditionalData: ApiMobileAdditionalData | null;
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
    getFeaturedCards: async (): Promise<ApiFeaturedMedicine[]> => {
        const response = await apiClient.get(API_ENDPOINTS.MEDICINES_FEATURED_CARDS);
        return response.data?.data ?? [];
    },
    getProductById: async (productId: string): Promise<ApiProductDetail> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.PRODUCT_BY_ID(productId));
            return response.data.data;
        } catch {
            const response = await apiClient.get(`/api/v1/medicines/${productId}`);
            return response.data.data;
        }
    },
    getProductByCatalogId: async (catalogId: string): Promise<ApiProductDetail> => {
        // catalogId is the alphanumeric productId (e.g. "CS-BDSMYG"), not the UUID id field
        const response = await apiClient.get(API_ENDPOINTS.PRODUCT_BY_ID(catalogId));
        return response.data.data;
    },
};
