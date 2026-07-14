import { MutationCache, QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppError } from '@/src/api/errors';

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: () => {},
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 24 * 60 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof AppError) {
          if (
            error.kind === 'unauthorized' ||
            error.kind === 'forbidden' ||
            error.kind === 'not_found' ||
            error.kind === 'validation' ||
            error.kind === 'network'
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
