import { apiClient } from "@/src/api/client";

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
};
