import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { apiCache, useCachedSeed, withSqliteCache } from "@/src/lib/sqlite/cache";
import { useAuthStore } from "@/src/store/authStore";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { searchApi } from "@/src/features/search/api/search.api";
import type {
  ApiSearchHistoryItem,
  ApiSearchMedicine,
  ApiTrendingItem,
} from "@/src/features/search/types";

export const useSearch = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Immediate sync for empty or very short strings to hide/show placeholders instantly
    if (query.trim().length < 1) {
      setDebouncedQuery(query.trim());
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500); // 500ms is a sweet spot for search

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.SEARCH.MEDICINES(debouncedQuery),
    queryFn: ({ pageParam = 1 }) =>
      searchApi.searchMedicines(debouncedQuery, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 30_000,
  });

  // Memoised so the list keeps a stable data reference while the user keeps typing.
  const results: ApiSearchMedicine[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  return {
    query,
    setQuery,
    results,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
    debouncedQuery,
  };
};

export const useSearchSuggestions = (query: string, limit = 8) => {
  // Debounce suggestions by 250ms — avoids firing a query on every keystroke.
  const [debouncedSuggestionQuery, setDebouncedSuggestionQuery] =
    useState(query);
  const suggestionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (suggestionDebounceRef.current)
      clearTimeout(suggestionDebounceRef.current);

    if (query.trim().length < 1) {
      // Clear immediately so suggestions hide the moment input is empty
      setDebouncedSuggestionQuery("");
      return;
    }

    suggestionDebounceRef.current = setTimeout(() => {
      setDebouncedSuggestionQuery(query.trim());
    }, 250);

    return () => {
      if (suggestionDebounceRef.current)
        clearTimeout(suggestionDebounceRef.current);
    };
  }, [query]);

  const { data, isFetching } = useQuery({
    queryKey: QUERY_KEYS.SEARCH.SUGGESTIONS(debouncedSuggestionQuery),
    queryFn: () =>
      searchApi.getSuggestions(debouncedSuggestionQuery, limit),
    enabled: debouncedSuggestionQuery.trim().length >= 2,
    staleTime: 0,
  });

  return { suggestions: data ?? [], isLoading: isFetching };
};

export const useSearchHistory = (limit = 10, offset = 0) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const cachedHistory =
    useCachedSeed<ApiSearchHistoryItem[]>("search_history");

  const historyKey = QUERY_KEYS.SEARCH.HISTORY({ limit, offset });

  const { data, isLoading, refetch } = useQuery({
    queryKey: historyKey,
    queryFn: withSqliteCache("search_history", () =>
      searchApi.getHistory(limit, offset),
    ),
    initialData: () => cachedHistory?.data,
    initialDataUpdatedAt: () => cachedHistory?.updatedAt ?? 0,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });

  const HISTORY_KEY_PREFIX = ["search", "history"];

  // Writes both the live query cache and the SQLite cold-start seed together,
  // so a restart right after an add/delete/clear doesn't resurrect the old
  // list. The background invalidate below still reconciles with server truth
  // (e.g. the real id/createdAt a record call doesn't return). Returns the
  // pre-update snapshot so a failed mutation's onError can restore it.
  const writeHistory = (
    updater: (current: ApiSearchHistoryItem[]) => ApiSearchHistoryItem[],
  ): ApiSearchHistoryItem[] => {
    const previous =
      queryClient.getQueryData<ApiSearchHistoryItem[]>(historyKey) ?? [];
    const next = updater(previous);
    queryClient.setQueryData(historyKey, next);
    apiCache.set("search_history", next);
    return previous;
  };

  // A failed mutation restores the exact pre-optimistic snapshot to both the
  // query cache and the SQLite seed, undoing writeHistory's side effects.
  const restoreHistory = (previous: ApiSearchHistoryItem[]) => {
    queryClient.setQueryData(historyKey, previous);
    apiCache.set("search_history", previous);
  };

  const { mutate: recordMutate } = useMutation({
    mutationFn: ({ query, productId }: { query: string; productId?: string }) =>
      searchApi.recordHistory(query, productId),
    // Move-to-front: drop any existing row for the same term first, then
    // prepend a synthetic row — the record API returns void, so the real
    // id/createdAt only arrive once the invalidate below refetches.
    onMutate: ({ query, productId }) =>
      writeHistory((current) => [
        {
          id: `optimistic-${Date.now()}`,
          query,
          productId,
          createdAt: new Date().toISOString(),
        },
        ...current.filter((item) => item.query !== query),
      ]),
    onError: (_err, _vars, previous) => {
      if (previous) restoreHistory(previous);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY_PREFIX }),
  });

  const { mutate: clearMutate, isPending: isClearingHistory } = useMutation({
    mutationFn: () => searchApi.clearHistory(),
    onMutate: () => writeHistory(() => []),
    onError: (_err, _vars, previous) => {
      if (previous) restoreHistory(previous);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY_PREFIX }),
  });

  const { mutate: deleteItemMutate } = useMutation({
    mutationFn: (id: string) => searchApi.deleteHistoryItem(id),
    onMutate: (id) =>
      writeHistory((current) => current.filter((item) => item.id !== id)),
    onError: (_err, _vars, previous) => {
      if (previous) restoreHistory(previous);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY_PREFIX }),
  });

  // Stable callbacks so screens can memoise the handlers built on top of them.
  const recordHistory = useCallback(
    (query: string, productId?: string) => recordMutate({ query, productId }),
    [recordMutate],
  );
  const clearHistory = useCallback(() => clearMutate(), [clearMutate]);
  const deleteHistoryItem = useCallback(
    (id: string) => deleteItemMutate(id),
    [deleteItemMutate],
  );

  return {
    history: data ?? [],
    isLoading,
    refetch,
    recordHistory,
    clearHistory,
    isClearingHistory,
    deleteHistoryItem,
  };
};

export const useTrendingSearches = (limit = 6) => {
  const cachedTrending = useCachedSeed<ApiTrendingItem[]>("search_trending");

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.SEARCH.TRENDING(limit),
    queryFn: withSqliteCache("search_trending", () =>
      searchApi.getTrending(limit),
    ),
    initialData: () => cachedTrending?.data,
    initialDataUpdatedAt: () => cachedTrending?.updatedAt ?? 0,
    staleTime: 30 * 60_000,
  });

  return { trending: data ?? [], isLoading };
};
