import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import { asError } from "@/src/api/errors";
import type { LocationPrediction, ResolvedLocation } from "../types/api.types";

/**
 * Shared by both resolve endpoints — they return the same shape, and both
 * answer a non-serviceable pincode with a non-2xx whose body still carries the
 * resolution, so that body is unwrapped rather than thrown (same contract as
 * `pincodeApi.check`).
 */
const resolve = async (
  url: string,
  params: Record<string, string | number>,
): Promise<ResolvedLocation> => {
  try {
    const res = await apiClient.get(url, { params });
    return res.data?.data ?? res.data;
  } catch (e) {
    const body = asError(e).response?.data;
    const payload = (body?.data ?? body) as
      Partial<ResolvedLocation> | undefined;
    if (payload && typeof payload.serviceable === "boolean") {
      return payload as ResolvedLocation;
    }
    throw e;
  }
};

/**
 * Google Places is proxied through our backend so the maps key stays server
 * side. Serviceability comes back with the resolve calls, so callers on these
 * paths don't need a separate pincode check.
 */
export const locationApi = {
  /** `signal` lets the caller abort an in-flight search when the query changes. */
  autocomplete: async (
    query: string,
    signal?: AbortSignal,
  ): Promise<LocationPrediction[]> => {
    const res = await apiClient.get(API_ENDPOINTS.LOCATION_AUTOCOMPLETE, {
      params: { q: query },
      signal,
    });
    return res.data?.data?.predictions ?? [];
  },

  resolvePlace: (placeId: string): Promise<ResolvedLocation> =>
    resolve(API_ENDPOINTS.LOCATION_RESOLVE_PLACE, { placeId }),

  resolveCoords: (lat: number, lng: number): Promise<ResolvedLocation> =>
    resolve(API_ENDPOINTS.LOCATION_RESOLVE_COORDS, { lat, lng }),
};
