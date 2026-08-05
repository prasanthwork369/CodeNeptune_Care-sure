import { locationApi, LocationPrediction } from "@/src/api/location.api";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/** The backend rejects shorter queries, so don't spend a request on them. */
const MIN_QUERY_LENGTH = 2;

/** Row shape the sheet renders: a bold first line over the full description. */
export interface LocationSuggestion extends LocationPrediction {
  mainText: string;
}

/** Backend autocomplete returns only a description, so the bold line is its first segment. */
const toSuggestion = (p: LocationPrediction): LocationSuggestion => ({
  ...p,
  mainText: p.description.split(",")[0].trim() || p.description,
});

/**
 * Debounced place search for the location sheet. React Query supplies the
 * abort signal, so a query that is superseded while typing is cancelled.
 */
export const useLocationSearch = (query: string, debounceMs = 400) => {
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const trimmed = query.trim();
    // Clear instantly on empty input so the saved-addresses list comes straight back.
    if (!trimmed) {
      setDebounced("");
      return;
    }
    const timer = setTimeout(() => setDebounced(trimmed), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Mirrors the web client: 2-char minimum, and suggestions are never served stale.
  const isSearchable = debounced.length >= MIN_QUERY_LENGTH;

  const { data, isFetching } = useQuery({
    queryKey: QUERY_KEYS.LOCATION.AUTOCOMPLETE(debounced),
    queryFn: ({ signal }) => locationApi.autocomplete(debounced, signal),
    enabled: isSearchable,
    staleTime: 0,
    select: (predictions) => predictions.map(toSuggestion),
  });

  return {
    predictions: isSearchable && data ? data : [],
    // Typing past the debounce window should keep the spinner on, not flash it off.
    isSearching:
      isFetching ||
      (query.trim().length >= MIN_QUERY_LENGTH && query.trim() !== debounced),
  };
};
