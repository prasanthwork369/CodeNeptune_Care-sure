export interface CreateOrderRequest {
  items: {
    medicineId: string;
    medicineSnapshot?: MedicineSnapshot;
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
  patientDetails?: {
    phone?: string;
    problem?: string;
    symptoms?: string;
    /** No prescription attached means the customer chose to skip it. */
    skipPrescription: boolean;
  };
  idempotencyKey?: string;
  couponCode?: string;
  [key: string]: unknown;
}

export interface MedicineSnapshot {
  name?: string;
  slug?: string;
  productId?: string;
  image?: string;
  brand?: string;
  pack?: string;
  mrp?: number | null; // prescription lines can carry an explicit null
  // Persisted at order creation so tracking can derive the discounted price the
  // customer paid — unitPrice is stored as the MRP (see buildOrderPayload).
  discountPercent?: number;
  discountPercentage?: number;
  requiresPrescription?: boolean;
}

export interface OrderItem {
  id: string;
  orderId: string;
  medicineId: string;
  productId?: string;
  medicineSnapshot?: MedicineSnapshot;
  quantity: number;
  unitPrice?: string;
  sellingPrice?: number | string;
  status: string;
  // The backend may surface MRP/discount at the item level (as in
  // getFrequentlyOrdered) rather than inside medicineSnapshot — read both.
  mrp?: number | string;
  discountPercent?: number | string;
  discountPercentage?: number | string;
  returnedQuantity?: number;
  isReturnable?: boolean;
  returnWindowDays?: number;
  returnDeadline?: string;
  isReturnEligibleNow?: boolean;
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
  customer?: {
    identifier?: string;
    firstName?: string;
    lastName?: string;
  };
  deliveryType?: string;
  status: number;
  // Corporate-billed orders are self-service-exempt — no customer Cancel/Return.
  isCorporateGeneratedOrder?: boolean;
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
  paymentMethod?: number | string;
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  confirmedAt?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items?: OrderItem[];
  returns?: {
    id: string;
    status: number;
    refundAmount?: string;
    createdAt?: string;
    statusLogs?: { fromStatus: number | null; toStatus: number; createdAt: string }[];
  }[];
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
  0: { label: "CANCELED", bg: "#FFF7ED", text: "#C47A00", border: "#FED7AA" },
  1: { label: "PLACED", bg: "#FFFBE8", text: "#7A7600", border: "#FDE047" },
  2: { label: "CONFIRMED", bg: "#ECFDF5", text: "#16A34A", border: "#BBF7D0" },
  3: { label: "VERIFIED", bg: "#ECFDF5", text: "#16A34A", border: "#BBF7D0" },
  // Raw 5 is CHECKED (internal warehouse step) — shown as PROCESSING, same as 4/9.
  4: { label: "PROCESSING", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  5: { label: "PROCESSING", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  6: { label: "SHIPPED", bg: "#E8F5FF", text: "#005F99", border: "#99CCFF" },
  7: { label: "DELIVERED", bg: "#ECFDF5", text: "#00703C", border: "#16A34A" },
  8: {
    label: "UNDER REVIEW",
    bg: "#F5F3FF",
    text: "#7C3AED",
    border: "#DDD6FE",
  },
  9: { label: "PROCESSING", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  10: {
    label: "UNDER REVIEW",
    bg: "#F5F3FF",
    text: "#7C3AED",
    border: "#DDD6FE",
  },
  11: {
    label: "UNDER REVIEW",
    bg: "#F5F3FF",
    text: "#7C3AED",
    border: "#DDD6FE",
  },
  12: {
    label: "DISPATCH CANCELLED",
    bg: "#FEF2F2",
    text: "#DC2626",
    border: "#FECACA",
  },
  // Raw 14 is the real PACKED status (raw 5 is the internal CHECKED step).
  14: { label: "PACKED", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
};
