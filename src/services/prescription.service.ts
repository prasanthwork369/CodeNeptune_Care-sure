import {
  prescriptionApi,
  PrescriptionListParams,
  PrescriptionUploadInput,
} from "@/src/api/prescription.api";
import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import {
  ApiPrescription,
  PrescriptionReminder,
  ReminderInput,
} from "@/src/types/prescription";
import { AppError } from "@/src/api/errors";

type SuccessResult<T> = { success: true; data: T };
// `code` lets callers distinguish e.g. "Health Updates disabled" from a generic failure.
type FailureResult = { success: false; error: string; code?: string };
type ServiceResult<T> = SuccessResult<T> | FailureResult;

function toFailure(err: unknown): FailureResult {
  if (err instanceof AppError) {
    const code = (err.data as { code?: string } | undefined)?.code;
    return { success: false, error: err.message, code };
  }
  if (err instanceof Error) return { success: false, error: err.message };
  return { success: false, error: "Something went wrong" };
}

export const prescriptionService = {
  upload: async (
    input: PrescriptionUploadInput,
  ): Promise<ServiceResult<ApiPrescription>> => {
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

  getByOrderNumber: async (
    orderId: string,
  ): Promise<ServiceResult<ApiPrescription>> => {
    try {
      const data = await prescriptionApi.getByOrderNumber(orderId);
      return { success: true, data };
    } catch (err) {
      return toFailure(err);
    }
  },

  list: async (
    params?: PrescriptionListParams,
  ): Promise<ServiceResult<ApiPrescription[]>> => {
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

  // Sets or updates the "Never Miss a Refill" reminder — every 7/14/21/30 days or a custom date.
  setReminder: async (
    id: string,
    input: ReminderInput,
  ): Promise<ServiceResult<PrescriptionReminder>> => {
    try {
      const data = await prescriptionApi.setReminder(id, input);
      return { success: true, data };
    } catch (err) {
      return toFailure(err);
    }
  },

  cancelReminder: async (id: string): Promise<ServiceResult<null>> => {
    try {
      await prescriptionApi.cancelReminder(id);
      return { success: true, data: null };
    } catch (err) {
      return toFailure(err);
    }
  },
};
