import React from "react";
import {
  renderWithProviders,
  fireEvent,
} from "@/__tests__/test-utils/renderWithProviders";
import { SearchPageLayout } from "@/src/features/search/screens/SearchPageLayout";
import { useSearch } from "@/src/hooks/queries/useSearch";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@/src/hooks/ui/useBottomInset", () => ({
  useAdjustedBottomInset: () => 0,
}));

jest.mock("@/src/hooks/ui/useIsOffline");

jest.mock("@/src/hooks/queries/useCart", () => ({
  useCart: () => ({ totalItems: 0 }),
}));

jest.mock("@/src/services/firebase", () => ({
  analyticsService: {
    logSearchStarted: jest.fn(),
    logSearchCompleted: jest.fn(),
  },
  PERF_TRACES: { SEARCH_QUERY_LOAD: "search_query_load" },
  usePerformanceTrace: () => ({ start: jest.fn(), stop: jest.fn() }),
}));

// The screen only needs its search-results branch exercised here — the idle
// state, suggestions bar and header are unrelated to retry behaviour.
jest.mock("@/src/features/search/comparison/components/ProductHeader", () => ({
  ProductHeader: () => null,
}));
jest.mock("@/src/features/search/sections/SearchRecentSection", () => ({
  SearchRecentSection: () => null,
}));
jest.mock("@/src/features/search/sections/SearchSuggestionsBar", () => ({
  SearchSuggestionsBar: () => null,
}));
jest.mock("@/src/features/search/sections/SearchEmptyState", () => ({
  SearchEmptyState: () => null,
}));
jest.mock("@/src/features/search/SearchSkeleton", () => ({
  SearchSkeleton: () => null,
}));
jest.mock("@/src/features/search/sections/SearchResultsList", () => {
  const { Text } = require("react-native");
  return {
    SearchResultsList: ({ results }: { results: unknown[] }) => (
      <Text testID="search-results-list">{results.length} results</Text>
    ),
  };
});

jest.mock("@/src/hooks/queries/useSearch", () => ({
  useSearch: jest.fn(),
  useSearchHistory: () => ({
    history: [],
    recordHistory: jest.fn(),
    clearHistory: jest.fn(),
    isClearingHistory: false,
    deleteHistoryItem: jest.fn(),
  }),
  useSearchSuggestions: () => ({ suggestions: [], isLoading: false }),
  useTrendingSearches: () => ({ trending: [] }),
}));

const mockUseSearch = useSearch as jest.MockedFunction<typeof useSearch>;
const mockUseIsOffline = useIsOffline as jest.MockedFunction<
  typeof useIsOffline
>;

const baseSearchState = {
  query: "paracetamol",
  setQuery: jest.fn(),
  results: [] as any[],
  isLoading: false,
  isFetching: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  error: null as Error | null,
  refetch: jest.fn(),
  debouncedQuery: "paracetamol",
};

describe("SearchPageLayout retry behaviour", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsOffline.mockReturnValue(false);
  });

  it("shows Retry when the API fails and there is no cached data", () => {
    mockUseSearch.mockReturnValue({
      ...baseSearchState,
      results: [],
      error: new Error("Network Error"),
    });

    const { getByText, queryByTestId } = renderWithProviders(
      <SearchPageLayout />,
    );

    expect(getByText("Search unavailable")).toBeTruthy();
    expect(getByText("Retry")).toBeTruthy();
    expect(queryByTestId("search-results-list")).toBeNull();
  });

  it("calls refetch when Retry is pressed", () => {
    const mockRefetch = jest.fn();
    mockUseSearch.mockReturnValue({
      ...baseSearchState,
      results: [],
      error: new Error("Network Error"),
      refetch: mockRefetch,
    });

    const { getByText } = renderWithProviders(<SearchPageLayout />);

    fireEvent.press(getByText("Retry"));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("keeps cached results visible during a background refetch failure", () => {
    mockUseSearch.mockReturnValue({
      ...baseSearchState,
      results: [{ id: "med-1" }, { id: "med-2" }] as any[],
      isFetching: true,
      error: new Error("Network Error"),
    });

    const { getByTestId, queryByText } = renderWithProviders(
      <SearchPageLayout />,
    );

    expect(getByTestId("search-results-list")).toBeTruthy();
    expect(queryByText("Search unavailable")).toBeNull();
  });

  it("shows the offline screen instead of Retry when offline", () => {
    mockUseIsOffline.mockReturnValue(true);
    mockUseSearch.mockReturnValue({
      ...baseSearchState,
      results: [],
      error: new Error("Network Error"),
    });

    const { getByText, queryByText, queryByTestId } = renderWithProviders(
      <SearchPageLayout />,
    );

    expect(getByText("No Internet Connection")).toBeTruthy();
    expect(queryByText("Search unavailable")).toBeNull();
    expect(queryByText("Retry")).toBeNull();
    expect(queryByTestId("search-results-list")).toBeNull();
  });
});
