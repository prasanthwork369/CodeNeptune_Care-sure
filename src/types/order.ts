export interface CreateOrderRequest {
  items: {
    medicineId: string;
    medicineSnapshot?: any;
    quantity: number;
    unitPrice: string;
  }[];
  deliveryAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark?: string;
  };
  subtotal: string;
  deliveryCharge?: string;
  taxAmount?: string;
  discountAmount?: string;
  total: string;
  deliveryType?: "HOME_DELIVERY" | "STORE_PICKUP";
  pharmacyId?: string;
  prescriptionId?: string;
  patientMemberIds?: string[];
  notes?: string;
  problem?: string | null;
  symptoms?: string | null;
  metadata?: OrderMetadata;
  isPurchased?: boolean;
}

export interface OrderMetadata {
  billBreakdown?: {
    itemTotal: number;
    productDiscount: number;
    couponDiscount: number;
    walletDiscount: number;
    coinsDiscount: number;
    creditsDiscount: number;
    deliveryFee: number;
    handlingCharge: number;
    totalSaved: number;
    toPay: number;
  };
  preferences?: {
    walletUsed: boolean;
    coinsUsed: boolean;
    creditsUsed: boolean;
    livePriceSyncUsed: boolean;
  };
  [key: string]: any;
}

export interface MedicineSnapshot {
  name?: string;
  slug?: string;
  productId?: string;
  image?: string;
  brand?: string;
  pack?: string;
  mrp?: number;
  requiresPrescription?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  medicineId: string;
  medicineSnapshot?: MedicineSnapshot;
  quantity: number;
  unitPrice?: string;
  status: string;
}

export interface StatusLog {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  reason?: string | null;
  performedBy?: string;
  performedByType?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  deliveryType?: string;
  status: number;
  deliveryAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark?: string;
  };
  total: string;
  subtotal?: string;
  deliveryCharge?: string;
  handlingCharge?: string;
  discountAmount?: string;
  prescriptionId?: string | null;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  confirmedAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items?: OrderItem[];
  returns?: { id: string; status: number }[];
  statusLogs?: StatusLog[];
  clinicalData?: ClinicalData;
  metadata?: OrderMetadata;
}

export interface ClinicalMedicine {
  name: string;
  quantity: number;
  unitPrice?: number;
  dosageForm?: string;
  medicineId?: string;
  instructions?: string;
  manufacturer?: string;
  originalName?: string;
  thumbnailUrl?: string;
  isDoctorAdded?: boolean;
}

export interface ClinicalPrescription {
  medicines: ClinicalMedicine[];
  patientId?: string;
  patientName: string;
  patientAge?: string | number;
  patientGender?: string;
}

export interface DoctorSnapshot {
  id?: string;
  name: string;
  signatureUrl?: string;
  registrationNumber?: string;
}

export interface ClinicalData {
  timestamp: string;
  approvedAt?: string;
  approvedBy?: string;
  doctorName: string;
  prescriptions: ClinicalPrescription[];
  doctorSnapshot?: DoctorSnapshot;
  registrationNumber?: string;
}

export interface TrackingStep {
  title: string;
  time: string;
  completed: boolean;
  cancelled?: boolean;
  isActive?: boolean;
}

export type OrderTabKey = "all" | "delivered" | "cancelled";

export const ORDER_STATUS: Record<
  number,
  { label: string; bg: string; text: string; border: string }
> = {
  0:  { label: "CANCELLED",    bg: "#FFF0F2", text: "#DC2626", border: "#FECDD3" },
  1:  { label: "ORDER PLACED", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  2:  { label: "CONFIRMED",    bg: "#ECFDF5", text: "#16A34A", border: "#BBF7D0" },
  3:  { label: "VERIFIED",     bg: "#ECFDF5", text: "#16A34A", border: "#BBF7D0" },
  4:  { label: "PROCESSING",   bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  5:  { label: "PACKED",       bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  6:  { label: "SHIPPED",      bg: "#E8F5FF", text: "#005F99", border: "#99CCFF" },
  7:  { label: "DELIVERED",    bg: "#ECFDF5", text: "#00703C", border: "#16A34A" },
  8:  { label: "UNDER REVIEW", bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
  9:  { label: "PROCESSING",   bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  10: { label: "UNDER REVIEW", bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
};
