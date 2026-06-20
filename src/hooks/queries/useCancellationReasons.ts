import { useQuery } from '@tanstack/react-query';
import { cancellationReasonService, GetCancellationReasonsParams } from '@/src/services/cancellation-reason.service';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';

/**
 * Fetches active cancellation reasons visible to the customer.
 *
 * Defaults: actor_type=1 (CUSTOMER), applicable_to=1 (ORDER), status=1 (ACTIVE).
 * Pass params to override any filter, e.g. for return reasons: { applicable_to: 2 }.
 */
export function useCancellationReasons(params: GetCancellationReasonsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.CANCELLATION_REASONS.LIST(params),
    queryFn: () => cancellationReasonService.list(params),
    staleTime: 5 * 60 * 1000, // 5 min — reasons rarely change
    retry: 1,
    refetchOnWindowFocus: false,
    select: (response) => response.data,
  });
}
