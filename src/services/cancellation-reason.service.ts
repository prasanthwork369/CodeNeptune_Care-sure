/**
 * @module services/cancellation-reason
 * Fetches active cancellation reasons for the customer website.
 *
 * status        => 1=ACTIVE
 * applicable_to => 1=ORDER | 2=RETURN | 3=BOTH
 * actor_type    => 1=CUSTOMER | 2=STAFF | 3=BOTH
 */

import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/utils/urls';

export interface CancellationReason {
  id:               number;
  label:            string;
  description:      string | null;
  applicable_to:    number;
  actor_type:       number;
  status:           number;
  sort_order:       number;
  applicableToLabel: string;
  actorTypeLabel:   string;
}

export interface CancellationReasonsResponse {
  success: boolean;
  data:    CancellationReason[];
  meta: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

export interface GetCancellationReasonsParams {
  /** 1=ORDER, 2=RETURN, 3=BOTH — defaults to ORDER */
  applicable_to?: number;
  /** 1=CUSTOMER, 2=STAFF, 3=BOTH — defaults to CUSTOMER */
  actor_type?: number;
  /** 1=ACTIVE, 2=INACTIVE, 0=CANCELLED — defaults to ACTIVE */
  status?: number;
  limit?: number;
  page?: number;
}

export const cancellationReasonService = {
  /**
   * Fetches active cancellation reasons.
   * Defaults pre-filter for customer-facing ORDER cancellations (actor_type=1, applicable_to=1, status=1).
   */
  list: async (params: GetCancellationReasonsParams = {}): Promise<CancellationReasonsResponse> => {
    const response = await apiClient.get<CancellationReasonsResponse>(
      API_ENDPOINTS.CANCELLATION_REASONS,
      {
        params: {
          status:        1, // ACTIVE only
          actor_type:    1, // CUSTOMER
          applicable_to: 1, // ORDER
          limit:         50,
          ...params,        // allow callers to override if needed
        },
      }
    );
    return response.data;
  },
};

export default cancellationReasonService;
