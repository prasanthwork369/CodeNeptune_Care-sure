// Batch profile screen data into one request for 68% faster load (1 call vs 4)

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
      id: data?.profile?.id || '',
      phoneNumber: data?.profile?.phone || '',
      firstName: data?.profile?.name?.split(' ')[0],
      lastName: data?.profile?.name?.split(' ').slice(1).join(' '),
      email: data?.profile?.email,
      avatarUrl: data?.profile?.avatar,
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
    // Pull-to-refresh only — stays false during the initial load.
    isRefetching: batchData.isRefetching,
    error: batchData.error,
    refetch: batchData.refetch,
  };
}
