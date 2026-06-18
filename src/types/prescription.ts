import { PrescriptionStatusValue } from "@/src/constants/prescription-status";

export interface PrescriptionItem {
    localUri: string;
    name: string;
    type: string;
    size?: number;
}

export interface Prescription {
    id: string;
    rxId: string;
    date: string;
    patient: string;
    doctor: string;
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
    ocrData?: { patientName?: string } | null;
    createdAt: string;
    updatedAt?: string;
}

export interface RequiresPrescriptionWarningProps {
    itemCount: number;
    items: any[];
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
    image: any;
    source?: string;
    toPay?: string;
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
}

export interface PreviewSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    onContinue: () => void;
    safeAreaBottom: number;
}
