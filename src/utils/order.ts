import { Address } from '@/src/api/address.api';
import { BillBreakdown } from '@/src/store/checkoutStore';
import { CartItem } from '@/src/types/cart';
import { CreateOrderRequest, OrderMetadata } from '@/src/types/order';

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
    items: cartItems.map((i) => ({
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
        mrp: i.metadata?.mrp ?? undefined,
        requiresPrescription: i.requiresPrescription,
      },
    })),
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
