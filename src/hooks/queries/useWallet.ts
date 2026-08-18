import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { walletService } from "../../services/wallet.service";
import { walletApi } from "@/src/features/wallet/api/wallet.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useAuthStore } from "../../store/authStore";
import { WalletLog } from "@/src/features/wallet/types";

const LOGS_PAGE_SIZE = 20;

export const useWalletBalance = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.WALLET.BALANCE,
    queryFn: () => walletService.getBalance(),
    enabled: isAuthenticated,
    staleTime: 60_000 * 5,
    retry: 1,
    // Balance can change while the app is backgrounded (top-up, order
    // deduction) — refresh it the moment the user comes back.
    refetchOnWindowFocus: true,
  });

  return {
    balance: data ?? null,
    loading: isLoading,
    refreshing: isRefetching,
    refetch,
  };
};

export const useAddMoney = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (amount: number) => walletApi.addMoney({ amount }),
    onSuccess: (updatedBalance) => {
      queryClient.setQueryData(
        QUERY_KEYS.CUSTOMER.WALLET.BALANCE,
        updatedBalance,
      );
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CUSTOMER.WALLET.LOGS({}),
      });
    },
  });

  return {
    addMoney: (amount: number) => mutation.mutateAsync(amount),
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};

export const useWalletLogs = (limit: number = 20, offset: number = 0) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.WALLET.LOGS({ limit, offset }),
    queryFn: () => walletService.getLogs(limit, offset),
    enabled: isAuthenticated,
    staleTime: 60_000 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    logs: data ?? [],
    loading: isLoading,
    refreshing: isRefetching,
    refetch,
  };
};

// The exact key useWalletLogs(LOGS_PAGE_SIZE, 0) builds — read-only, to seed
// the infinite query below. Deliberately NOT the infinite query's own key:
// a regular query's cache entry (a flat array) and an infinite query's cache
// entry ({pages, pageParams}) are different shapes and must never share a
// cache slot, or whichever hook reads it second breaks.
const firstPageKey = QUERY_KEYS.CUSTOMER.WALLET.LOGS({
  limit: LOGS_PAGE_SIZE,
  offset: 0,
});

export const useInfiniteWalletLogs = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.CUSTOMER.WALLET.LOGS({ limit: LOGS_PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      walletService.getLogs(LOGS_PAGE_SIZE, pageParam),
    enabled: isAuthenticated,
    initialPageParam: 0,
    getNextPageParam: (lastPage: WalletLog[], _pages, lastPageParam) =>
      lastPage.length < LOGS_PAGE_SIZE
        ? undefined
        : lastPageParam + LOGS_PAGE_SIZE,
    // Only consulted when THIS query has no cache entry of its own yet, so
    // an already-loaded infinite cache (e.g. the user scrolled History
    // before) is never overwritten. Reshapes Wallet home's already-fetched
    // first page (useWalletLogs(20, 0)) into the InfiniteData shape this
    // query expects, so History can paint instantly instead of refetching
    // the same 20 rows the user just saw.
    initialData: () => {
      const firstPage = queryClient.getQueryData<WalletLog[]>(firstPageKey);
      if (!firstPage) return undefined;
      return { pages: [firstPage], pageParams: [0] };
    },
    // Carries over the ACTUAL fetch time of that seeded page, not "now" —
    // otherwise a first page fetched 4 minutes ago would read as fresh for
    // another full staleTime window instead of refetching on schedule.
    initialDataUpdatedAt: () => queryClient.getQueryState(firstPageKey)?.dataUpdatedAt,
    staleTime: 60_000 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    logs: query.data?.pages.flat() ?? [],
    loading: query.isLoading,
    refreshing: query.isRefetching,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
  };
};

/**
 * Warms wallet balance + the first wallet-logs page ahead of navigating to
 * Wallet from a wallet notification, using the exact same keys/queryFns
 * useWalletBalance and useWalletLogs(20, 0) read (firstPageKey is the same
 * constant useInfiniteWalletLogs reads above — nothing new is introduced).
 * Never throws — a failed/slow prefetch just means Wallet falls back to its
 * own normal fetch-on-mount, same as today.
 */
const prefetchWallet = (queryClient: QueryClient): void => {
  void queryClient
    .prefetchQuery({
      queryKey: QUERY_KEYS.CUSTOMER.WALLET.BALANCE,
      queryFn: () => walletService.getBalance(),
    })
    .catch(() => {});
  void queryClient
    .prefetchQuery({
      queryKey: firstPageKey,
      queryFn: () => walletService.getLogs(LOGS_PAGE_SIZE, 0),
    })
    .catch(() => {});
};

/** Stable callback for wiring prefetchWallet into a wallet notification tap. */
export const usePrefetchWallet = () => {
  const queryClient = useQueryClient();
  return useCallback(() => prefetchWallet(queryClient), [queryClient]);
};
