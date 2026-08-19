/** Fetch public system document templates (invoices, receipts, etc.) */

import { apiClient } from "@/src/api/client";

export interface SystemTemplate {
  id: string;
  name: string;
  event: string;
  channel: string;
  subject: string | null;
  body: string;
  redirectUrl: string | null;
}

interface SystemTemplateResponse {
  success: boolean;
  data: SystemTemplate;
  message?: string;
}

export const systemTemplatesApi = {
  /** Fetch active template by event and channel */
  getPublicTemplate: async (
    event: string,
    channel = "DOCUMENT",
    variables?: Record<string, unknown>,
  ): Promise<SystemTemplate> => {
    const { data } = await apiClient.get<SystemTemplateResponse>(
      "/api/v1/system-templates/public",
      {
        params: {
          event,
          channel,
          ...(variables && Object.keys(variables).length > 0
            ? { variables: JSON.stringify(variables) }
            : {}),
        },
      },
    );

    if (data.success) {
      return data.data;
    }

    throw new Error(
      data.message || `Failed to fetch system template for event "${event}"`,
    );
  },
};
