import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SearchPageLayout } from "@/src/features/search/screens/SearchPageLayout";

const mockRecordHistory = jest.fn();

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@/src/hooks/ui/useBottomInset", () => ({
  useAdjustedBottomInset: () => 0,
}));

jest.mock("@/src/hooks/ui/useIsOffline", () => ({
  useIsOffline: () => false,
}));

jest.mock("@/src/features/cart/hooks/useCartRead", () => ({
  useCartRead: () => ({ totalItems: 0 }),
}));

jest.mock("@/src/services/firebase", () => ({
  analyticsService: {
    logSearchStarted: jest.fn(),
    logSearchCompleted: jest.fn(),
  },
  PERF_TRACES: { SEARCH_QUERY_LOAD: "search_query_load" },
  usePerformanceTrace: () => ({ start: jest.fn(), stop: jest.fn() }),
}));

// Real behaviour under test — mock only what a text-input tap can't drive
// (useFocusEffect/useNav internals) while keeping the actual query/submit wiring.
jest.mock("@/src/features/search/comparison/components/ProductHeader", () => {
  const { TextInput } = require("react-native");
  return {
    ProductHeader: ({
      query,
      onQueryChange,
      onSubmit,
    }: {
      query?: string;
      onQueryChange?: (text: string) => void;
      onSubmit?: () => void;
    }) => (
      <TextInput
        testID="search-input"
        value={query}
        onChangeText={onQueryChange}
        onSubmitEditing={onSubmit}
      />
    ),
  };
});

jest.mock("@/src/features/search/sections/SearchRecentSection", () => ({
  SearchRecentSection: () => null,
}));
jest.mock("@/src/features/search/sections/SearchEmptyState", () => ({
  SearchEmptyState: () => null,
}));
jest.mock("@/src/features/search/SearchSkeleton", () => ({
  SearchSkeleton: () => null,
}));
jest.mock("@/src/features/search/sections/SearchResultsList", () => ({
  SearchResultsList: () => null,
}));

// Debounce mechanics live in useSearch/useSearchSuggestions and aren't the
// concern of this test — only the page's dismiss/reappear wiring is.
jest.mock("@/src/features/search/hooks/useSearch", () => {
  const ReactActual = require("react");
  return {
    useSearch: () => {
      const [query, setQuery] = ReactActual.useState("");
      return {
        query,
        setQuery,
        results: [],
        isLoading: false,
        isFetching: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        error: null,
        refetch: jest.fn(),
        debouncedQuery: query,
      };
    },
    useSearchHistory: () => ({
      history: [],
      recordHistory: mockRecordHistory,
      clearHistory: jest.fn(),
      isClearingHistory: false,
      deleteHistoryItem: jest.fn(),
    }),
    useSearchSuggestions: (query: string) => ({
      suggestions:
        query.trim().length >= 2 ? [`suggestion for ${query.trim()}`] : [],
    }),
    useTrendingSearches: () => ({ trending: [] }),
  };
});

describe("SearchPageLayout — Related Search show/hide behaviour", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows suggestions while typing, hides them on submit, and brings them back on edit", async () => {
    const { getByTestId, getByText } = render(<SearchPageLayout />);
    const input = getByTestId("search-input");

    fireEvent.changeText(input, "para");
    await waitFor(() => expect(getByText("suggestion for para")).toBeTruthy());
    expect(getByTestId("search-suggestions-bar").props.pointerEvents).toBe(
      "auto",
    );

    fireEvent(input, "submitEditing");
    // The bar collapses via animation rather than unmounting, so assert on
    // the visible-driven pointerEvents flag instead of the node disappearing.
    await waitFor(() =>
      expect(getByTestId("search-suggestions-bar").props.pointerEvents).toBe(
        "none",
      ),
    );
    expect(mockRecordHistory).toHaveBeenCalledWith("para");

    fireEvent.changeText(input, "parace");
    await waitFor(() =>
      expect(getByText("suggestion for parace")).toBeTruthy(),
    );
    expect(getByTestId("search-suggestions-bar").props.pointerEvents).toBe(
      "auto",
    );
  });

  it("tapping a suggestion runs the search and hides the suggestions", async () => {
    const { getByTestId, getByText } = render(<SearchPageLayout />);
    const input = getByTestId("search-input");

    fireEvent.changeText(input, "para");
    await waitFor(() => expect(getByText("suggestion for para")).toBeTruthy());

    fireEvent.press(getByText("suggestion for para"));

    expect(mockRecordHistory).toHaveBeenCalledWith("suggestion for para");
    await waitFor(() =>
      expect(getByTestId("search-suggestions-bar").props.pointerEvents).toBe(
        "none",
      ),
    );
  });
});
