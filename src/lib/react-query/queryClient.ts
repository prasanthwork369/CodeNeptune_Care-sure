import { MutationCache, QueryClient } from '@tanstack/react-query';
import { AppError } from '@/src/api/errors';

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
            error.kind === 'validation'
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
