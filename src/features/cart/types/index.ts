import type { Product } from "@/src/features/product/types";
import type { Coupon } from "./api.types";

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
  image: { uri: string } | null;
  rx: boolean;
}

export interface CartEmptyStateProps {
  featuredProducts: Product[];
  onAddItem: (product: Product) => Promise<unknown>;
}

export interface CartDeliveringToProps {
  label: string;
  description: string;
  onChange: () => void;
  actionLabel?: string;
  flat?: boolean;
}

export interface CartSavingsBannerProps {
  firstName: string;
  totalSavings: number;
  /** Drives the banner's shrink-on-scroll — normal height at rest, compact while scrolled. */
  scrollY?: import("react-native-reanimated").SharedValue<number>;
}

export interface CartFreeDeliveryProgressProps {
  remainingForFreeDelivery: number;
  progress: number;
}

export interface CartItemsListProps {
  lines: CartLine[];
  onUpdateItem: (
    itemId: string,
    input: { quantity: number },
  ) => Promise<unknown>;
  onRemoveItem: (itemId: string) => Promise<unknown>;
}

/** The coupon currently held in couponStore, not the full catalog Coupon. */
export interface AppliedCoupon {
  code: string;
  discount: number;
  description: string;
}

export interface CartCouponSectionProps {
  appliedCoupon: AppliedCoupon | null;
  onRemove: () => void;
  subtotal: number;
}

export interface CartWalletSectionProps {
  value: boolean;
  walletBalance: number;
  onToggle: (v: boolean) => void;
  /** False once Coupon + Coins + Corporate Credits already cover the whole
   * bill — nothing left for Wallet to offset, so the toggle is disabled
   * (but stays togglable off if it was already on). */
  hasRemainingAmount?: boolean;
  /** Amount of walletBalance this order is currently using (0 while toggled
   * off) — subtracted from the displayed balance so it reflects what's left. */
  discountApplied?: number;
}

export interface CartCorporateCreditsSectionProps {
  value: boolean;
  balance: number;
  onToggle: (v: boolean) => void;
  eligible?: boolean;
  remainingForEligibility?: number;
  /** False once Coins + Wallet already cover the whole bill — nothing left for
   * Corporate Credits to offset, so the toggle is disabled (but stays
   * togglable off if it was already on). */
  hasRemainingAmount?: boolean;
  /** Amount of balance this order is currently using (0 while toggled off) —
   * subtracted from the displayed balance so it reflects what's left. */
  discountApplied?: number;
}

export interface CartCoinsSectionProps {
  value: boolean;
  availableCoins: number;
  redeemedCoins: number;
  onToggle: () => void;
  onInfoPress: () => void;
  /** False once Corporate Credits + Wallet already cover the whole bill —
   * nothing left for Coins to offset, so the toggle is disabled (but stays
   * togglable off if it was already on). */
  hasRemainingAmount?: boolean;
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
  /** False while admin charge settings are still loading — blocks checkout so
   * a bill without delivery/handling can't be frozen into an order. */
  canProceed?: boolean;
  /** Rx carts go to choose-method first, so the button reads "Checkout" not "Pay". */
  hasRxItem?: boolean;
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
  // The coupon currently applied to the cart — the card is faded to feel inactive.
  isApplied?: boolean;
  // Failed pre-validation (e.g. usage limit reached) — faded but still pressable
  // so tapping Apply surfaces the reason toast.
  isUnavailable?: boolean;
  loading?: boolean;
}

export * from "./api.types";
