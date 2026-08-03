/**
 * @module src/hooks/queries/useSystemTemplates
 * TanStack Query hook for fetching public system document templates.
 */

import { useQuery } from "@tanstack/react-query";
import { systemTemplatesService } from "@/src/services/system-templates.service";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";

/**
 * Hook to fetch a single active system template by its unique (event, channel) key.
 *
 * @param event     - The system event name (e.g. 'INVOICE_DOCUMENT')
 * @param channel   - The channel (default: 'DOCUMENT')
 * @param variables - Optional map used to interpolate {{variableName}} placeholders
 *                    (e.g. { orderId: '...', customerName: '...' })
 * @param enabled   - Optionally disable the query until event/variables are known
 *
 * @example
 * const { data: template, isLoading } = useSystemTemplate('INVOICE_DOCUMENT', 'DOCUMENT', { orderId: '123' });
 * // template.body contains the full HTML/CSS document string with variables resolved
 */
export function useSystemTemplate(
  event: string,
  channel = "DOCUMENT",
  variables?: Record<string, unknown>,
  enabled = true,
) {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_TEMPLATES.BY_EVENT(event, channel, variables),
    queryFn: () =>
      systemTemplatesService.getPublicTemplate(event, channel, variables),
    enabled: enabled && !!event,
    staleTime: 10 * 60 * 1000, // 10 minutes — document templates rarely change
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}
