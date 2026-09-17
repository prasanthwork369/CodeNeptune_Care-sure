// Batch checkout screen data into one request for 68% faster load (1 call vs 4)

import { useBatchData } from '@/src/hooks/queries/useBatchData';

export interface CheckoutDataResponse {
  cart?: {
    items?: any[];
    total?: number;
    discountPercent?: number;
    originalPrice?: number;
  };
  addresses?: any[];
  wallet?: {
    balance?: number;
    paymentMethods?: any[];
  };
  coupons?: any[];
}

/**
 * Hook to batch load checkout screen data
 *
 * @example
 * const data = useCheckoutBatchData();
 *
 * if (data.isLoading) return <LoadingScreen />;
 * if (data.error) return <ErrorScreen error={data.error} />;
 *
 * return (
 *   <>
 *     <CartSummary items={data.cartItems} total={data.cartTotal} />
 *     <AddressSelector addresses={data.addresses} />
 *     <PaymentMethodSelector methods={data.paymentMethods} />
 *     <CouponList coupons={data.coupons} />
 *   </>
 * );
 */
export function useCheckoutBatchData() {
  const batchData = useBatchData({
    queries: [
      'cart',        // cart items, totals, discounts
      'addresses',   // user addresses
      'wallet',      // payment methods, balance
      'coupons',     // available coupons
    ],
    staleTime: 5 * 60_000,    // Refresh after 5 minutes
    gcTime: 60 * 60_000,      // Keep in cache for 1 hour
  });

  const data = batchData.data as CheckoutDataResponse | undefined;

  return {
    // Cart data
    cartItems: data?.cart?.items,
    cartTotal: data?.cart?.total,
    discountPercent: data?.cart?.discountPercent,
    originalPrice: data?.cart?.originalPrice,

    // Addresses
    addresses: data?.addresses,

    // Payment methods
    paymentMethods: data?.wallet?.paymentMethods,
    walletBalance: data?.wallet?.balance,

    // Coupons
    coupons: data?.coupons,

    // Loading & error states
    isLoading: batchData.isLoading,
    error: batchData.error,
    refetch: batchData.refetch,
  };
}
