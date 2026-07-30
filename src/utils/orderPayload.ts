import { CreateOrderRequest, OrderMetadata } from "@/src/types/order";

export type OrderBillBreakdown = NonNullable<OrderMetadata["billBreakdown"]>;

export type PrescriptionOrderLine = {
  medicineId: string;
  quantity: number;
  unitPrice: number;
  medicineName: string;
  medicineSlug?: string;
  productId?: string | null;
  image?: string | null;
  mrp?: number | null;
};

export type CartOrderLine = {
  medicineId: string;
  quantity: number;
  unitPrice: string | number;
  medicineName: string;
  medicineSlug?: string;
  productId?: string | null;
  image?: string | null;
  requiresPrescription?: boolean;
  metadata?: {
    productId?: string | null;
    image?: string | null;
    brand?: string;
    pack?: string;
    mrp?: number | null;
  } | null;
};

export type OrderDeliveryAddress = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string | null;
};

type OrderItems = CreateOrderRequest["items"];

// Prescription lines are always Rx and carry no cart metadata.
export const buildPrescriptionOrderItems = (
  lines: PrescriptionOrderLine[],
): OrderItems =>
  lines.map((i) => ({
    medicineId: i.medicineId,
    quantity: i.quantity,
    unitPrice: String(i.unitPrice),
    medicineSnapshot: {
      name: i.medicineName,
      slug: i.medicineSlug,
      productId: i.productId ?? undefined,
      image: i.image ?? undefined,
      mrp: i.mrp,
      requiresPrescription: true,
    },
  }));

// Cart lines fall back to metadata for fields the backend may not have promoted yet.
export const buildCartOrderItems = (lines: CartOrderLine[]): OrderItems =>
  lines.map((i) => ({
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
  }));

export const computeItemsSubtotal = (items: OrderItems) =>
  items.reduce((sum, i) => sum + parseFloat(i.unitPrice) * i.quantity, 0);

export const sumOrderDiscounts = (bill: OrderBillBreakdown) =>
  bill.productDiscount +
  bill.couponDiscount +
  bill.walletDiscount +
  bill.coinsDiscount +
  bill.creditsDiscount;

export type BuildOrderPayloadArgs = {
  items: OrderItems;
  address: OrderDeliveryAddress;
  bill: OrderBillBreakdown;
  /** Server-calculated subtotal; falls back to the sum of the lines. */
  subtotal?: number | null;
  idempotencyKey: string;
  couponCode?: string | null;
  walletUsed: boolean;
  coinsUsed: boolean;
  creditsUsed: boolean;
  prescriptionId?: string;
  patientMemberId?: string;
  patientPhone?: string;
  problem?: string;
  symptoms?: string;
};

export const buildOrderPayload = ({
  items,
  address,
  bill,
  subtotal,
  idempotencyKey,
  couponCode,
  walletUsed,
  coinsUsed,
  creditsUsed,
  prescriptionId,
  patientMemberId,
  patientPhone,
  problem,
  symptoms,
}: BuildOrderPayloadArgs): CreateOrderRequest => ({
  items,
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
  subtotal: String(Number(subtotal ?? computeItemsSubtotal(items)).toFixed(2)),
  deliveryCharge: String(bill.deliveryFee),
  taxAmount: "0",
  discountAmount: String(sumOrderDiscounts(bill).toFixed(2)),
  total: String(Number(bill.toPay).toFixed(2)),
  deliveryType: "HOME_DELIVERY",
  patientMemberIds: patientMemberId ? [patientMemberId] : undefined,
  prescriptionId: prescriptionId || undefined,
  isPurchased: prescriptionId ? true : undefined,
  problem: problem || undefined,
  symptoms: symptoms || undefined,
  metadata: {
    billBreakdown: bill,
    idempotencyKey,
    preferences: {
      walletUsed,
      coinsUsed,
      creditsUsed,
      livePriceSyncUsed: false,
    },
    couponCode: couponCode ?? "",
    patientDetails: {
      phone: patientPhone || undefined,
      problem: problem || undefined,
      // No prescription attached means the customer chose to skip it.
      skipPrescription: !prescriptionId,
      symptoms: symptoms || undefined,
    },
  },
});
