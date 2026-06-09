import { apiClient } from './client';
import { API_ENDPOINTS } from '../utils/urls';

interface ApiSalt {
    name: string;
    amount: number;
    unit: string;
}

interface ApiPrescriptionMedicine {
    id: string;
    productId?: string;
    name: string;
    brand: string;
    form: string;
    mrp: string | number;
    sellingPrice: number;
    discount: number;
    image: string;
    salts: ApiSalt[];
    slug: string;
}

export interface ApiPrescriptionOrderItem {
    original: ApiPrescriptionMedicine;
    recommended: ApiPrescriptionMedicine;
    medicineQuantity: number;
    recommendationMedicineQuantity: number;
}

export const prescriptionOrderApi = {
    getMedicines: async (orderId: string): Promise<ApiPrescriptionOrderItem[]> => {
        const response = await apiClient.get(API_ENDPOINTS.PRESCRIPTION_ORDER_MEDICINES(orderId));
        const raw = response.data?.data;
        if (Array.isArray(raw?.comparisonData)) return raw.comparisonData;
        if (Array.isArray(raw)) return raw;
        return [];
    },
};
