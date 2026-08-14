import { PrescriptionStatusValue } from "@/src/constants/prescription-status";
import type { FileUploadState } from "@/src/hooks/ui/usePrescriptionUploader";
import type { CartItem } from "./cart";

export interface PrescriptionItem {
  localUri: string;
  name: string;
  type: string;
  size?: number;
  /**
   * True only when `localUri` points at a copy this app made in the cache
   * directory. The user's own gallery/document file is never marked, so
   * cleanup can never delete it.
   */
  isTempCopy?: boolean;
}

export interface Prescription {
  id: string;
  rxId: string;
  date: string;
  patient: string;
  doctor: string;
}

/** Preset "Never Miss a Refill" chip values shown in the picker UI. */
export type ReminderFrequencyDays = 7 | 14 | 21 | 30;

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

export interface RequiresPrescriptionWarningProps {
  itemCount: number;
  // Only the label is rendered, so this takes any cart-item-shaped row.
  items: Pick<CartItem, "id" | "medicineName">[];
}

export interface UploadMethodCardProps {
  isSelected: boolean;
  onSelect: () => void;
}

export interface CallMethodCardProps {
  isSelected: boolean;
  onSelect: () => void;
}

export interface ChooseMethodFooterProps {
  toPay: string;
  safeAreaBottom: number;
  canProceed: boolean;
  onProceed: () => void;
  buttonLabel: string;
}

export interface PrescriptionHistoryItemData {
  id: string;
  rawId: string;
  status: string;
  patientName: string;
  doctorName: string;
  uploadedDate: string;
  image: string[]; // prescription page URLs, in order
  source?: string;
  toPay?: string;
  prescriptionOrderId?: string | null;
  reviewNotes?: string | null;
  rejectionReasons?: string[];
}

export interface PrescriptionHistoryItemProps {
  item: PrescriptionHistoryItemData;
}

export interface PreviewDisplayProps {
  activeItem: PrescriptionItem | null;
  screenWidth: number;
  previewHeight: number;
  onLayout: (height: number) => void;
  onPrev?: () => void;
  showPrev: boolean;
  onNext?: () => void;
  showNext: boolean;
}

export interface PreviewThumbnailsProps {
  items: PrescriptionItem[];
  activeIndex: number;
  maxFiles: number;
  onAdd: () => void;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  safeAreaBottom: number;
  /** Per-file upload state, keyed by uploadKeyOf(item). */
  uploadStates?: Record<string, FileUploadState>;
  onRetry?: (item: PrescriptionItem) => void;
}

export interface PreviewSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  safeAreaBottom: number;
}
