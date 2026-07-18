import { Address } from '@/src/api/address.api';
import { BillBreakdown } from '@/src/store/checkoutStore';
import { CartItem } from '@/src/types/cart';
import { CreateOrderRequest, OrderItem, OrderMetadata } from '@/src/types/order';

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
  const billBreakdown: NonNullable<OrderMetadata['billBreakdown']> = {
    itemTotal:       bill?.subtotal        ?? 0,
    productDiscount: bill?.productDiscount ?? 0,
    couponDiscount:  bill?.couponDiscount  ?? 0,
    walletDiscount:  bill?.walletDiscount  ?? 0,
    coinsDiscount:   bill?.coinsDiscount   ?? 0,
    creditsDiscount: bill?.corporateCreditsDiscount ?? 0,
    deliveryFee:     bill?.deliveryFee     ?? 0,
    handlingCharge:  bill?.handlingCharge  ?? 0,
    totalSaved:      bill?.totalSaved      ?? 0,
    toPay:           bill?.toPay          ?? parseFloat(toPay),
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
    subtotal: String(Number(bill?.subtotal ?? cartItems.reduce((s, i) => s + parseFloat(String(i.unitPrice)) * i.quantity, 0)).toFixed(2)),
    deliveryCharge: String(billBreakdown.deliveryFee),
    taxAmount: '0',
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
      couponCode: couponCode ?? '',
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
  discountPercent: number; // stored discount %, shown directly (not re-derived)
}

const round2 = (n: number) => parseFloat(n.toFixed(2));

// Derives an order item's display prices. unitPrice is the MRP (strikethrough).
// Preferred source is the per-item snapshot discount (mirrors the web). When the
// snapshot carries no discount but the order as a whole did (its billBreakdown
// shows a product discount), fall back to the order-level ratio so the item row
// stays consistent with the bill summary instead of showing the full MRP.
export function getOrderItemPricing(
  item: OrderItem,
  orderDiscountRatio?: number,
): OrderItemPricing {
  const mrp = Number(item.unitPrice ?? 0);
  // Use `||` (not `??`) to match the web: a stored discountPercent of 0 must fall
  // through to discountPercentage, where the real value lives for some items.
  const discount = Number(
    item.medicineSnapshot?.discountPercent ||
      item.medicineSnapshot?.discountPercentage ||
      0,
  );

  // 1. Per-item snapshot discount (exact stored %).
  if (discount > 0) {
    return {
      sellingPrice: round2(mrp * (1 - discount / 100)),
      mrp,
      discountPercent: discount,
    };
  }

  // 2. No per-item discount, but the order had one → distribute it by MRP.
  if (
    orderDiscountRatio != null &&
    orderDiscountRatio > 0 &&
    orderDiscountRatio < 1
  ) {
    return {
      sellingPrice: round2(mrp * orderDiscountRatio),
      mrp,
      discountPercent: round2((1 - orderDiscountRatio) * 100),
    };
  }

  // 3. No discount anywhere — single price, no strikethrough.
  return { sellingPrice: mrp, mrp, discountPercent: 0 };
}
