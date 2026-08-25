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
  isReturnable?: boolean;
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
  // The saved address's own backend id — separate from the deliveryAddress
  // snapshot above, which the backend keeps even if that address is later edited.
  addressId?: string;
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

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  sortOrder?: "asc" | "desc";
}

/** One mapped row from getFrequentlyOrdered — the shape the UI consumes. */
export interface FrequentOrderItem {
  id: string;
  medicineId: string;
  productId?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: { uri?: string };
  discount?: string;
  requiresPrescription: boolean;
  brand?: string;
  slug?: string;
  category: string;
  orderedTimes: number;
  lastOrdered?: string;
  lastQty?: number;
  packSize: string;
  unit: string;
}

// ─── Return Types ────────────────────────────────────────────────────────────

export interface ReturnItemImages {
  front?: string;
  back?: string;
  packaging?: string;
  issue?: string;
}

export interface ConfirmedReturnItem {
  orderItemId: string;
  medicineId: string;
  quantity: number;
  reason: string;
  images: ReturnItemImages;
  details?: string;
  name: string;
  unitPrice: number;
  total: number;
  thumbnailUrl?: string;
}

export interface CreateReturnRequest {
  orderId: string;
  refundMethod: number;
  items: {
    orderItemId: string;
    medicineId: string;
    quantity: number;
    reason: string;
    images: ReturnItemImages;
    details?: string;
  }[];
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  refundMethod: number;
  status: number;
  createdAt: string;
  items: ConfirmedReturnItem[];
}
