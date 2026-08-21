import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSearchSuggestions } from "@/src/features/search/hooks/useSearch";
import { searchApi } from "@/src/features/search/api/search.api";

jest.mock("@/src/features/search/api/search.api", () => ({
  searchApi: {
    getSuggestions: jest.fn(),
  },
}));

const mockGetSuggestions = searchApi.getSuggestions as jest.Mock;

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useSearchSuggestions — no loader, no stale results", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns nothing below the 2-character threshold", () => {
    const { result } = renderHook(() => useSearchSuggestions("p"), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(mockGetSuggestions).not.toHaveBeenCalled();
  });

  it("keeps the area empty (no stale flash) while the matching fetch is in flight", async () => {
    let resolveFetch: (value: string[]) => void = () => {};
    mockGetSuggestions.mockReturnValue(
      new Promise<string[]>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const { result } = renderHook(() => useSearchSuggestions("para"), {
      wrapper: createWrapper(),
    });

    // Nothing renders while the request is pending — no loader spinner needed.
    expect(result.current.suggestions).toEqual([]);

    await act(async () => {
      resolveFetch(["paracetamol", "paracetamol 650"]);
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(result.current.suggestions).toEqual([
        "paracetamol",
        "paracetamol 650",
      ]),
    );
  });

  it("does not show the previous query's results once the user keeps typing", () => {
    mockGetSuggestions.mockResolvedValue(["para result"]);

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useSearchSuggestions(query),
      { wrapper: createWrapper(), initialProps: { query: "para" } },
    );

    // The debounce hasn't caught up to "parac" yet, so the "para" query's
    // (possibly already-resolved) results must not flash for the new query.
    rerender({ query: "parac" });
    expect(result.current.suggestions).toEqual([]);
  });
});
