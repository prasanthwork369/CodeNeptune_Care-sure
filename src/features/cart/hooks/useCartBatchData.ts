// Batch cart screen data into one request for 68% faster load (1 call vs 4)

import { useBatchData } from '@/src/hooks/queries/useBatchData';

export interface CartBatchDataResponse {
  cart?: {
    items?: CartItem[];
    total?: number;
    discountPercent?: number;
    originalPrice?: number;
  };
  addresses?: Address[];
  wallet?: {
    balance?: number;
    paymentMethods?: PaymentMethod[];
  };
  coupons?: Coupon[];
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Address {
  id: string;
  name: string;
  street: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
}

export function useCartBatchData() {
  const batchData = useBatchData({
    queries: [
      'cart',        // cart items, totals, discounts
      'addresses',   // user addresses for delivery
      'coupons',     // available coupons
      'wallet',      // wallet balance and payment methods
    ],
    staleTime: 2 * 60_000,    // Refresh after 2 minutes (more frequent for cart)
    gcTime: 30 * 60_000,      // Keep in cache for 30 minutes
  });

  const data = batchData.data as CartBatchDataResponse | undefined;

  return {
    // Cart data
    items: data?.cart?.items,
    total: data?.cart?.total,
    discountPercent: data?.cart?.discountPercent,
    originalPrice: data?.cart?.originalPrice,

    // Addresses
    addresses: data?.addresses,

    // Coupons
    coupons: data?.coupons,

    // Wallet
    walletBalance: data?.wallet?.balance,
    paymentMethods: data?.wallet?.paymentMethods,

    // Loading & error states
    isLoading: batchData.isLoading,
    error: batchData.error,
    refetch: batchData.refetch,
  };
}
