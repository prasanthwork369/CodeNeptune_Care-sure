import { ApiPrescription, PrescriptionReminder, ReminderInput } from '@/src/types/prescription';
import { API_ENDPOINTS } from '@/src/utils/urls';
import { apiClient } from './client';

export interface PrescriptionListParams {
  page?: number;
  limit?: number;
  status?: number;
  excludeStatus?: number;
  orderId?: string;
  category?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface PrescriptionUploadInput {
  imageUrls: string[];
  category?: number;
  orderId?: string;
  doctorName?: string;
  issuedDate?: string;
  notes?: string;
}

export const prescriptionApi = {
  upload: async (input: PrescriptionUploadInput): Promise<ApiPrescription> => {
    const response = await apiClient.post(API_ENDPOINTS.PRESCRIPTIONS, input);
    return response.data.data;
  },

  getById: async (id: string): Promise<ApiPrescription> => {
    const response = await apiClient.get(API_ENDPOINTS.PRESCRIPTION_BY_ID(id));
    return response.data.data;
  },

  list: async (params?: PrescriptionListParams): Promise<ApiPrescription[]> => {
    const response = await apiClient.get(API_ENDPOINTS.PRESCRIPTIONS, { params });
    return response.data.data;
  },

  dismiss: async (id: string): Promise<ApiPrescription> => {
    const response = await apiClient.patch(API_ENDPOINTS.PRESCRIPTION_DISMISS(id));
    return response.data.data;
  },

  // Sets or updates the "Never Miss a Refill" reminder — recurring frequency or custom date.
  setReminder: async (id: string, input: ReminderInput): Promise<PrescriptionReminder> => {
    const response = await apiClient.put(API_ENDPOINTS.PRESCRIPTION_REMINDER(id), input);
    return response.data.data;
  },

  cancelReminder: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PRESCRIPTION_REMINDER(id));
  },
};
