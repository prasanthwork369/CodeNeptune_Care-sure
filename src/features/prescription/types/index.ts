import type { FileUploadState } from "../hooks/usePrescriptionUploader";
import type { CartItem } from "@/src/features/cart/types";
import type { ImageSource } from "expo-image";

export interface ComparisonMedicine {
  id: string;
  saltComposition: string;
  prescribed: {
    name: string;
    manufacturer: string;
    packagingDetail: string;
    image: ImageSource | null;
    mrp: number;
  };
  recommended: {
    id: string;
    productId?: string;
    slug: string;
    name: string;
    manufacturer: string;
    packagingDetail: string;
    image: ImageSource | null;
    price: number;
    mrp: number;
    discountPercent: number;
  };
  quantity?: number;
}

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

export interface PrescriptionComparisonItem {
  id: string;
  prescribedMedicine: string;
  recommendedMedicine: string;
  dosage: string;
  instructions: string;
  price: number;
  originalPrice: number;
  savings: number;
  requiresPrescription: boolean;
}

export interface PatientPrescriptionPreviewProps {
  items: { localUri: string; name: string; type: string }[];
  onAddPress?: () => void;
  onItemPress?: (index: number) => void;
}

export interface PatientSelectionChipsProps {
  members: import("@/src/features/profile/types").FamilyMember[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export interface PatientContactInfoProps {
  phone: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (val: string) => void;
  saving: boolean;
}

export interface PatientVitalInfoProps {
  age: string;
  gender: "MALE" | "FEMALE" | string;
}

export interface PatientHealthProblemProps {
  selected: import("./api.types").HealthProblem | null;
  onPress: () => void;
  customText?: string;
  setCustomText?: (text: string) => void;
}

export interface PatientSymptomsInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export interface PatientSelectionFooterProps {
  toPay: string;
  patientName: string | null;
  safeAreaBottom: number;
  onProceed: () => void;
}

export * from "./api.types";
