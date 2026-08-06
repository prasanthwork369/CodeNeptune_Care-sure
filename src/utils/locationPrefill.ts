import type { ResolvedLocation } from "@/src/api/location.api";

/** Route params the add-address screen reads to pre-fill its form. */
export type PrefillParams = Record<string, string>;

/**
 * Builds add-address prefill from a resolved location.
 */
export const toPrefillParams = (
  resolved: ResolvedLocation,
  localityHint?: string,
): PrefillParams => {
  const line2 = localityHint?.trim() || resolved.formattedAddress || "";
  const city = resolved.area?.city ?? "";
  const state = resolved.area?.state ?? "";

  const params: PrefillParams = {};
  if (line2) params.prefill_line2 = line2;
  if (city) params.prefill_city = city;
  if (state) params.prefill_state = state;
  if (resolved.pincode) params.prefill_pincode = resolved.pincode;
  return params;
};
