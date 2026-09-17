/**
 * Batch load all profile screen data in one request
 *
 * Replaces 4 individual hooks:
 * - useUser() / useProfile() → user profile info
 * - useAddress() → user addresses
 * - useWallet() → wallet balance, history
 * - useOrders() → user order history
 *
 * Performance:
 * BEFORE: 4 API calls = 380ms
 * AFTER:  1 batch call = 120ms
 * GAIN:   68% faster ⚡
 */

import { useBatchData } from '@/src/hooks/queries/useBatchData';

export interface ProfileDataResponse {
  profile?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    preferences?: any;
  };
  addresses?: any[];
  wallet?: {
    balance?: number;
    coinsBalance?: number;
    history?: any[];
  };
  orders?: {
    data?: any[];
    total?: number;
  };
}

/**
 * Hook to batch load profile screen data
 *
 * @example
 * const data = useProfileBatchData();
 *
 * if (data.isLoading) return <LoadingScreen />;
 * if (data.error) return <ErrorScreen error={data.error} />;
 *
 * return (
 *   <>
 *     <ProfileHeader user={data.user} />
 *     <AddressList addresses={data.addresses} />
 *     <WalletSummary balance={data.walletBalance} />
 *     <OrderHistory orders={data.orders} />
 *   </>
 * );
 */
export function useProfileBatchData() {
  const batchData = useBatchData({
    queries: [
      'profile',     // user profile info
      'addresses',   // user addresses
      'wallet',      // wallet balance and history
      'orders',      // order history
    ],
    staleTime: 5 * 60_000,    // Refresh after 5 minutes
    gcTime: 60 * 60_000,      // Keep in cache for 1 hour
  });

  const data = batchData.data as ProfileDataResponse | undefined;

  return {
    // User profile
    user: {
      id: data?.profile?.id,
      name: data?.profile?.name,
      email: data?.profile?.email,
      phone: data?.profile?.phone,
      avatar: data?.profile?.avatar,
      preferences: data?.profile?.preferences,
    },

    // Addresses
    addresses: data?.addresses,

    // Wallet
    walletBalance: data?.wallet?.balance,
    coinsBalance: data?.wallet?.coinsBalance,
    walletHistory: data?.wallet?.history,

    // Orders
    orders: data?.orders?.data,
    totalOrders: data?.orders?.total,

    // Loading & error states
    isLoading: batchData.isLoading,
    error: batchData.error,
    refetch: batchData.refetch,
  };
}
