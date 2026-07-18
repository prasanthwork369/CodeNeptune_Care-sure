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
}

// Derives an order item's per-unit prices for display (paid price + strikethrough
// MRP). The MRP and discount can live either inside medicineSnapshot or at the
// item level depending on the order's age/source, so both are checked.
export function getOrderItemPricing(item: OrderItem): OrderItemPricing {
  const snap = item.medicineSnapshot;
  const unit = Number(item.unitPrice ?? 0);

  const discountPercent = Number(
    snap?.discountPercent ??
      snap?.discountPercentage ??
      item.discountPercent ??
      item.discountPercentage ??
      0,
  );

  // Prefer an explicit MRP; if absent, fall back to unitPrice (which is stored
  // as the MRP for app-created orders).
  const mrpRaw = snap?.mrp ?? item.mrp;
  const mrp = mrpRaw != null ? Number(mrpRaw) : unit;

  let sellingPrice: number;
  if (discountPercent > 0) {
    // unitPrice is the MRP → derive the discounted price the customer paid.
    sellingPrice = parseFloat((mrp * (1 - discountPercent / 100)).toFixed(2));
  } else {
    // No explicit discount: trust unitPrice as the paid price and only show a
    // strikethrough if a genuinely higher MRP was provided.
    sellingPrice = Math.min(unit, mrp);
  }

  return { sellingPrice, mrp: Math.max(mrp, sellingPrice) };
}
