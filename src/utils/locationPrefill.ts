import type { ResolvedLocation } from "@/src/api/location.api";

/** Route params the add-address screen reads to pre-fill its form. */
export type PrefillParams = Record<string, string>;

/** Everything before the city in "A, B, City, State 400058, India". */
const localityFromAddress = (formatted: string, city: string): string => {
  const parts = formatted
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const cityIndex = city
    ? parts.findIndex((p) => p.toLowerCase() === city.toLowerCase())
    : -1;
  const locality =
    cityIndex > 0 ? parts.slice(0, cityIndex) : parts.slice(0, 1);
  return locality.join(", ");
};

/**
 * Builds add-address prefill from a resolved location. The resolve endpoints
 * return no street/house detail, so line1 is left for the user to type and
 * line2 takes the locality portion of the address. `localityHint` lets the
 * search flow pass the suggestion's own wording instead.
 */
export const toPrefillParams = (
  resolved: ResolvedLocation,
  localityHint?: string,
): PrefillParams => {
  const city = resolved.area?.city ?? "";
  const state = resolved.area?.state ?? "";
  const line2 =
    localityHint?.trim() ||
    localityFromAddress(resolved.formattedAddress ?? "", city);

  const params: PrefillParams = {};
  if (line2) params.prefill_line2 = line2;
  if (city) params.prefill_city = city;
  if (state) params.prefill_state = state;
  if (resolved.pincode) params.prefill_pincode = resolved.pincode;
  return params;
};
