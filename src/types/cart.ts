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
  metadata?: {
    productId?: string;
    selectedVariantId?: string; // variant UUID — present when item is a pack-size variant
    variants?: any[]; // full variants array enriched by backend
    selectedSize?: number;
    packSize?: string;
    unit?: string;
    price?: number;
    image?: string;
    manufacturer?: string | null;
    [key: string]: any;
  };
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
  metadata?: Record<string, any>;
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

export interface CartLine {
  id: string;
  productId: string; // resolved catalog ID; may be slug/UUID for legacy items
  productIdResolved: boolean; // true = confirmed catalog ID; false = may need search fallback
  medicineId: string; // medicine UUID — used for search fallback on legacy items
  name: string;
  brand: string;
  pack: string;
  discount: string;
  mrp: number;
  price: number;
  qty: number;
  image: any;
  rx: boolean;
}

export interface CartEmptyStateProps {
  featuredProducts: any[];
  onAddItem: (product: any) => Promise<any> | any;
}

export interface CartDeliveringToProps {
  label: string;
  description: string;
  onChange: () => void;
  flat?: boolean;
}

export interface CartSavingsBannerProps {
  firstName: string;
  totalSavings: number;
}

export interface CartFreeDeliveryProgressProps {
  remainingForFreeDelivery: number;
  progress: number;
}

export interface CartItemsListProps {
  lines: CartLine[];
  onUpdateItem: (itemId: string, input: { quantity: number }) => Promise<any>;
  onRemoveItem: (itemId: string) => Promise<any>;
}

export interface CartCouponSectionProps {
  appliedCoupon: any;
  onRemove: () => void;
  subtotal: number;
}

export interface CartWalletSectionProps {
  value: boolean;
  walletBalance: number;
  onToggle: (v: boolean) => void;
}

export interface CartCorporateCreditsSectionProps {
  value: boolean;
  balance: number;
  onToggle: (v: boolean) => void;
  eligible?: boolean;
  remainingForEligibility?: number;
}

export interface CartCoinsSectionProps {
  value: boolean;
  availableCoins: number;
  redeemedCoins: number;
  onToggle: () => void;
  onInfoPress: () => void;
}

export interface CartBillSummaryProps {
  mrpTotal: number;
  toPay: number;
  onPress: () => void;
}

interface SavingsRow {
  label: string;
  value: number;
}

export interface CartSavingsBreakdownProps {
  totalSavings: number;
  rows: SavingsRow[];
}

export interface CartFooterProps {
  toPay: number;
  safeAreaBottom: number;
  onProceed: () => void;
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
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message?: string;
  code?: string;
  remainingAmount?: number;
}

export interface CouponInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onApply: () => void;
  loading?: boolean;
}

export interface CouponCardProps {
  coupon: Coupon;
  onApply: (code: string) => void;
  disabled?: boolean;
}
