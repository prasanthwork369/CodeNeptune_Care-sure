import { apiClient } from "@/src/api/client";
import { API_ENDPOINTS } from "@/src/utils/urls";
import type { Faq } from "@/src/features/support/types";

export const websiteContentsApi = {
  getContent: async (category: string) => {
    const { data } = await apiClient.get(
      `/api/v1/website-contents/${category}`,
    );
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || `Failed to fetch ${category} content`);
  },
  getActiveFaqs: async (): Promise<Faq[]> => {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WEBSITE_CONTENTS_FAQS_ACTIVE,
    );
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || "Failed to fetch FAQs");
  },
};
