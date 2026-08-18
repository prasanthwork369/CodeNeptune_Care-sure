import type { Address } from "@/src/types/address";
import { BillBreakdown } from "@/src/store/checkoutStore";
import { CartItem } from "@/src/features/cart/types";
import {
  CreateOrderRequest,
  OrderItem,
  OrderMetadata,
} from "@/src/features/orders/types";

export interface BuildOrderPayloadParams {
  cartItems: CartItem[];
  address: Address;
  bill: BillBreakdown | null;
  toPay: string;
  walletUsed: boolean;
  coinsUsed: boolean;
  corporateCreditsUsed: boolean;
  couponCode: string;
  patientMemberId?: string;
  prescriptionId?: string;
  problem?: string;
  symptoms?: string;
  patientPhone?: string;
}

export function buildOrderPayload({
  cartItems,
  address,
  bill,
  toPay,
  walletUsed,
  coinsUsed,
  corporateCreditsUsed,
  couponCode,
  patientMemberId,
  prescriptionId,
  problem,
  symptoms,
  patientPhone,
}: BuildOrderPayloadParams): CreateOrderRequest {
  const billBreakdown: NonNullable<OrderMetadata["billBreakdown"]> = {
    itemTotal: bill?.subtotal ?? 0,
    productDiscount: bill?.productDiscount ?? 0,
    couponDiscount: bill?.couponDiscount ?? 0,
    walletDiscount: bill?.walletDiscount ?? 0,
    coinsDiscount: bill?.coinsDiscount ?? 0,
    creditsDiscount: bill?.corporateCreditsDiscount ?? 0,
    deliveryFee: bill?.deliveryFee ?? 0,
    handlingCharge: bill?.handlingCharge ?? 0,
    totalSaved: bill?.totalSaved ?? 0,
    toPay: bill?.toPay ?? parseFloat(toPay),
  };
  const totalDiscount =
    billBreakdown.productDiscount +
    billBreakdown.couponDiscount +
    billBreakdown.walletDiscount +
    billBreakdown.coinsDiscount;

  return {
    items: cartItems.map((i) => {
      // unitPrice from the cart is the MRP; the customer pays mrp*(1-disc/100).
      // Persist the MRP and discount so tracking can show the discounted price
      // (matches useCartCalculations).
      const mrp = parseFloat(String(i.unitPrice));
      const discountPercent = Number(
        i.discountPercent ?? i.metadata?.discountPercent ?? 0,
      );
      return {
        medicineId: i.medicineId,
        quantity: i.quantity,
        unitPrice: String(i.unitPrice),
        medicineSnapshot: {
          name: i.medicineName,
          slug: i.medicineSlug,
          productId: i.productId ?? i.metadata?.productId ?? undefined,
          image: i.image ?? i.metadata?.image ?? undefined,
          brand: i.metadata?.brand ?? undefined,
          pack: i.metadata?.pack ?? undefined,
          mrp: i.metadata?.mrp ?? mrp,
          discountPercent,
          requiresPrescription: i.requiresPrescription,
        },
      };
    }),
    deliveryAddress: {
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country ?? "IN",
    },
    subtotal: String(
      Number(
        bill?.subtotal ??
          cartItems.reduce(
            (s, i) => s + parseFloat(String(i.unitPrice)) * i.quantity,
            0,
          ),
      ).toFixed(2),
    ),
    deliveryCharge: String(billBreakdown.deliveryFee),
    taxAmount: "0",
    discountAmount: String(totalDiscount.toFixed(2)),
    total: toPay,
    deliveryType: "HOME_DELIVERY" as const,
    patientMemberIds: patientMemberId ? [patientMemberId] : undefined,
    prescriptionId: prescriptionId || undefined,
    isPurchased: prescriptionId ? true : undefined,
    problem: problem || undefined,
    symptoms: symptoms || undefined,
    metadata: {
      billBreakdown,
      preferences: {
        walletUsed,
        coinsUsed,
        creditsUsed: corporateCreditsUsed,
        livePriceSyncUsed: false,
      },
      couponCode: couponCode ?? "",
      patientDetails: {
        phone: patientPhone || undefined,
        problem: problem || undefined,
        skipPrescription: !prescriptionId,
        symptoms: symptoms || undefined,
      },
    },
  };
}

export interface OrderItemPricing {
  sellingPrice: number; // per unit, discounted — what the customer paid
  mrp: number; // per unit, original (strikethrough)
  discountPercent: number; // item-specific only; never derived from order totals
}

const round2 = (n: number) => parseFloat(n.toFixed(2));

const toNonNegativeFinite = (value: unknown): number | undefined => {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const toValidDiscount = (value: unknown): number | undefined => {
  const parsed = toNonNegativeFinite(value);
  return parsed != null && parsed > 0 && parsed <= 100
    ? round2(parsed)
    : undefined;
};

const firstNonNegativeFinite = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const parsed = toNonNegativeFinite(value);
    if (parsed != null) return parsed;
  }
  return undefined;
};

const firstValidDiscount = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const discount = toValidDiscount(value);
    if (discount != null) return discount;
  }
  return undefined;
};

// New orders store MRP in unitPrice. Some legacy/backend records expose an
// explicit item MRP and use unitPrice or sellingPrice as the paid price.
export function getOrderItemPricing(
  item: OrderItem,
  orderPriceEstimateRatio?: number,
): OrderItemPricing {
  const unitPrice = toNonNegativeFinite(item.unitPrice);
  const explicitMrp = firstNonNegativeFinite(
    item.mrp,
    item.medicineSnapshot?.mrp,
  );
  const explicitSellingPrice = toNonNegativeFinite(item.sellingPrice);
  const mrp = explicitMrp ?? unitPrice ?? explicitSellingPrice ?? 0;
  const itemSellingPrice =
    explicitSellingPrice ??
    (explicitMrp != null && unitPrice != null && unitPrice < explicitMrp
      ? unitPrice
      : undefined);

  const directDiscount = firstValidDiscount(
    item.discountPercent,
    item.discountPercentage,
    item.medicineSnapshot?.discountPercent,
    item.medicineSnapshot?.discountPercentage,
  );

  // Exact item fields have priority over values derived from item prices.
  if (directDiscount != null) {
    const calculatedSellingPrice =
      mrp > 0 ? round2(mrp * (1 - directDiscount / 100)) : 0;
    const sellingPrice =
      itemSellingPrice != null && (mrp <= 0 || itemSellingPrice <= mrp)
        ? itemSellingPrice
        : calculatedSellingPrice;
    return {
      sellingPrice: round2(sellingPrice),
      mrp,
      discountPercent: directDiscount,
    };
  }

  // Without a direct field, derive only from this item's own prices.
  if (
    mrp > 0 &&
    itemSellingPrice != null &&
    itemSellingPrice >= 0 &&
    itemSellingPrice < mrp
  ) {
    return {
      sellingPrice: round2(itemSellingPrice),
      mrp,
      discountPercent: round2(((mrp - itemSellingPrice) / mrp) * 100),
    };
  }

  // The order ratio may estimate a missing selling price for legacy records,
  // but deliberately returns 0% so it never leaks into an item discount badge.
  const validEstimateRatio =
    orderPriceEstimateRatio != null &&
    Number.isFinite(orderPriceEstimateRatio) &&
    orderPriceEstimateRatio > 0 &&
    orderPriceEstimateRatio <= 1
      ? orderPriceEstimateRatio
      : undefined;
  if (mrp > 0 && validEstimateRatio != null) {
    return {
      sellingPrice: round2(mrp * validEstimateRatio),
      mrp,
      discountPercent: 0,
    };
  }

  // No reliable item discount data — single price, no badge.
  return { sellingPrice: mrp, mrp, discountPercent: 0 };
}

/**
 * Formats raw order IDs (UUIDs, ObjectIds, numeric strings) into a clean,
 * consistent, human-readable standard format: `CS-XXXXXX` (e.g. `CS-6F5A2B`).
 */
export function formatOrderId(rawId?: string | number): string {
  if (rawId == null) return "";
  const str = String(rawId).trim();
  if (!str) return "";

  const cleanAlphanumeric = str.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleanAlphanumeric) return str.toUpperCase();

  const suffix = cleanAlphanumeric.slice(-6).toUpperCase();
  return `CS-${suffix}`;
}
