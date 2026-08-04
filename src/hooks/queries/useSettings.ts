import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { MobileAppLinks, UploadConfig } from "../../api/settings.api";
import { WEB_BASE_URL } from "../../utils/urls";
import { apiCache, withSqliteCache } from "../../lib/sqlite/cache";
import { settingsService } from "../../services/settings.service";
import {
  MAX_SIZE_BYTES,
  PRESCRIPTION_VALIDITY_MONTHS,
} from "../../utils/prescription";

// Falls back to local URLs so one failed request can't leave the links dead all session.
export function useMobileAppLinks() {
  const query = useQuery({
    queryKey: ["mobile-app-links"],
    queryFn: () => settingsService.getMobileAppLinks(),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const data: MobileAppLinks = {
    termsLink: query.data?.termsLink || `${WEB_BASE_URL}/terms`,
    refundLink: query.data?.refundLink || `${WEB_BASE_URL}/returns`,
    privacyLink: query.data?.privacyLink || `${WEB_BASE_URL}/privacy`,
  };

  return { ...query, data };
}

export function useCartWalletSettings() {
  return useQuery({
    queryKey: ["cart-wallet-settings"],
    queryFn: () => settingsService.getCartWalletSettings(),
    staleTime: 5 * 60 * 1000, // Caches for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ["payment-settings"],
    queryFn: () => settingsService.getPaymentSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Renders a month count the way the design writes it: whole years read as
 * years ("1 year"), anything else stays in months ("3 months").
 */
const formatValidity = (months: number): string => {
  if (months > 0 && months % 12 === 0) {
    const years = months / 12;
    return `${years} ${years === 1 ? "year" : "years"}`;
  }
  return `${months} ${months === 1 ? "month" : "months"}`;
};

/**
 * Backend-owned upload rules, resolved to usable values.
 *
 * The fallbacks are applied here rather than at each call site so a screen can
 * never render a limit the backend disagrees with just because the request is
 * still in flight or failed offline.
 */
export function useUploadConfig() {
  // Seeded from SQLite so the real limits are on the very first render and
  // survive being offline. Without this the hardcoded fallbacks below would
  // show on every cold start until the request landed, briefly telling the
  // user a limit the admin never set.
  // Read once per mount — this is a blocking getFirstSync + JSON.parse, and
  // React Query only consumes it to seed initialData.
  const [cached] = useState(() =>
    apiCache.getWithMeta<UploadConfig>("upload_config"),
  );

  const query = useQuery({
    queryKey: ["upload-config"],
    queryFn: withSqliteCache("upload_config", () =>
      settingsService.getUploadConfig(),
    ),
    initialData: () => cached?.data,
    initialDataUpdatedAt: () => cached?.updatedAt ?? 0,
    staleTime: 24 * 60 * 60 * 1000, // Rules change rarely; cache for a day
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const maxFileSizeMb = query.data?.maxFileSizeMb;
  const maxSizeBytes =
    maxFileSizeMb && maxFileSizeMb > 0
      ? maxFileSizeMb * 1024 * 1024
      : MAX_SIZE_BYTES;

  const validityMonths =
    query.data?.prescriptionValidityMonths ?? PRESCRIPTION_VALIDITY_MONTHS;

  return {
    ...query,
    maxSizeBytes,
    /** Ready-to-render "10 MB" — every screen that shows the limit needs it. */
    maxSizeLabel: `${Math.round(maxSizeBytes / (1024 * 1024))} MB`,
    validityMonths,
    /** Ready-to-render "3 months" / "1 year". */
    validityLabel: formatValidity(validityMonths),
  };
}
