/** Free-form bag the backend round-trips; the listed keys are the ones we read. */
export interface CartItemMetadata {
  productId?: string;
  selectedVariantId?: string; // variant UUID — present when item is a pack-size variant
  variants?: unknown[]; // full variants array enriched by backend
  selectedSize?: number;
  packSize?: string;
  pack?: string;
  unit?: string;
  price?: number;
  mrp?: number;
  discountPercent?: number;
  brand?: string;
  image?: string;
  manufacturer?: string | null;
  [key: string]: unknown;
}

export interface CartItem {
  id: string;
  cartId: string;
  medicineId: string;
  productId?: string; // catalog ID enriched by backend (e.g. "CS-0025") — same as web CartItem
  // variantId is NOT returned as top-level by backend — check metadata.selectedVariantId instead
  medicineName: string;
  medicineSlug: string;
  unitPrice: string | number;
  quantity: number;
  requiresPrescription: boolean;
  prescriptionId?: string | null;
  metadata?: CartItemMetadata;
  createdAt: string;
  updatedAt: string;

  // Enriched fields returned by backend
  livePrice?: string | number;
  priceChanged?: boolean;
  productType?: number;
  unit?: string;
  packSize?: string;
  packagingDetail?: string; // human-readable packaging string, e.g. "Strip of 10 tablets"
  dosageForm?: string;

  // UI fields
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  image?: string;
}

/**
 * Represents the full cart object returned by the order-service.
 */
export interface Cart {
  id: string;
  customerId: string;
  status: "active" | "checked_out" | "expired";
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface AddToCartInput {
  medicineId: string;
  variantId: string | null;
  medicineName: string;
  medicineSlug: string;
  unitPrice: number;
  mrp: number;
  discountPercent: number;
  quantity: number;
  requiresPrescription: boolean;
  image?: string;
  prescriptionId?: string;
  metadata?: CartItemMetadata;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CheckoutInput {
  pharmacyId: string;
  deliveryType: "HOME_DELIVERY" | "STORE_PICKUP";
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark?: string;
  };
  paymentMethod: "COD" | "UPI" | "CARD" | "WALLET" | "NET_BANKING";
  prescriptionId?: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: number;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderValue: number;
  maxUses: number | null;
  maxUsesPerCustomer: number;
  startsAt: string;
  expiresAt: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  /** Server flag: this customer has hit their per-customer usage limit. */
  isUsedUp?: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message?: string;
  code?: string;
  remainingAmount?: number;
}
