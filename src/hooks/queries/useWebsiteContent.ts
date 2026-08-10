import { useQuery } from "@tanstack/react-query";
import { websiteContentsService } from "../../services/website-content.service";

export const websiteContentsKeys = {
  all: ["website-contents"] as const,
  category: (category: string) => ["website-contents", category] as const,
};

export function useWebsiteContent(category: string) {
  return useQuery({
    queryKey: websiteContentsKeys.category(category),
    queryFn: () => websiteContentsService.getContent(category),
    staleTime: 10 * 60 * 1000, // 10 minutes stale time
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
