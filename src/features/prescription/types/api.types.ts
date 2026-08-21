import { PrescriptionStatusValue } from "../constants/prescription-status";

/**
 * Set-reminder payload. The backend only accepts a day-count — a custom
 * calendar date is never sent as-is, it's converted to "days from today"
 * first (see ReminderSheet). Any positive integer is valid, not just the
 * 7/14/21/30 chip presets.
 */
export type ReminderInput = { frequencyDays: number };

/** Refill reminder attached to a prescription; null/absent when never set. */
export interface PrescriptionReminder {
  status: "active" | "cancelled" | "completed" | string;
  /** "once" for custom-date reminders; null frequencyDays goes with it. */
  type?: "recurring" | "once";
  /** Day count the reminder was set with — a custom date may be any value, not just the chip presets. */
  frequencyDays: number | null;
  nextRemindAt: string | null;
}

/**
 * Shape returned by GET /api/v1/prescriptions (and by id). `isDismissed` and
 * `isPurchased` are server-computed and read-only from the client — there is
 * no endpoint to set them. Banner visibility must be derived from these
 * fields directly, never from local/AsyncStorage state.
 */
export interface ApiPrescription {
  id: string;
  rxId?: string;
  status: PrescriptionStatusValue;
  category?: number;
  isDismissed: boolean;
  isPurchased: boolean;
  prescriptionOrderId?: string | null;
  imageUrls?: string[];
  fileData?: FileData[];
  doctorName?: string | null;
  customer?: { firstName?: string; lastName?: string } | null;
  ocrData?: {
    patientName?: string;
    /** One reason per uploaded file when automated verification fails. */
    rejectionReasons?: string[];
  } | null;
  /** Why a prescription was rejected — set by automated OCR or a pharmacist. */
  reviewNotes?: string | null;
  reminder?: PrescriptionReminder | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PrescriptionListParams {
  page?: number;
  limit?: number;
  status?: number;
  excludeStatus?: number;
  orderId?: string;
  category?: number;
  sortOrder?: "asc" | "desc";
}

export interface FileData {
  name?: string;
  size?: string;
  url?: string;
}

export interface PrescriptionUploadInput {
  fileData?: FileData[];
  category?: number;
  orderId?: string;
  doctorName?: string;
  issuedDate?: string;
  notes?: string;
}

// ─── Prescription Order / Medicine Comparison Transport Types ─────────────────

export interface ApiSalt {
  name: string;
  amount: number;
  unit: string;
}

export interface ApiPrescriptionMedicine {
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
  original: ApiPrescriptionMedicine | null;
  recommended: ApiPrescriptionMedicine;
  medicineQuantity: number | null;
  recommendationMedicineQuantity: number;
  isAddedByCaller?: boolean;
  originalName?: string | null;
  notes?: string | null;
  id?: string;
}

// ─── Health Problem Transport Types ──────────────────────────────────────────

export interface HealthProblem {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}
