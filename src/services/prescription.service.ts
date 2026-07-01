import { prescriptionApi, PrescriptionListParams, PrescriptionUploadInput } from '@/src/api/prescription.api';
import { PRESCRIPTION_CATEGORY } from '@/src/constants/prescription-category';
import { ApiPrescription } from '@/src/types/prescription';
import { AppError } from '@/src/api/errors';

type SuccessResult<T> = { success: true; data: T };
type FailureResult = { success: false; error: string };
type ServiceResult<T> = SuccessResult<T> | FailureResult;

function toFailure(err: unknown): FailureResult {
  if (err instanceof AppError) return { success: false, error: err.message };
  if (err instanceof Error) return { success: false, error: err.message };
  return { success: false, error: 'Something went wrong' };
}

export const prescriptionService = {
  upload: async (input: PrescriptionUploadInput): Promise<ServiceResult<ApiPrescription>> => {
    try {
      const data = await prescriptionApi.upload({
        ...input,
        category: input.category ?? PRESCRIPTION_CATEGORY.ORDER,
      });
      return { success: true, data };
    } catch (err) {
      return toFailure(err);
    }
  },

  getById: async (id: string): Promise<ServiceResult<ApiPrescription>> => {
    try {
      const data = await prescriptionApi.getById(id);
      return { success: true, data };
    } catch (err) {
      return toFailure(err);
    }
  },

  list: async (params?: PrescriptionListParams): Promise<ServiceResult<ApiPrescription[]>> => {
    try {
      const data = await prescriptionApi.list(params);
      return { success: true, data };
    } catch (err) {
      return toFailure(err);
    }
  },

  dismiss: async (id: string): Promise<ServiceResult<ApiPrescription>> => {
    try {
      const data = await prescriptionApi.dismiss(id);
      return { success: true, data };
    } catch (err) {
      return toFailure(err);
    }
  },
};
