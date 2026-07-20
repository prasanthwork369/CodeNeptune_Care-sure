import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { searchApi, ApiSearchMedicine } from '../../api/search.api';
import { searchService } from '../../services/search.service';
import { useAuthStore } from '@/src/store/authStore';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';

export const useSearch = () => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
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
    } = useInfiniteQuery({
        queryKey: QUERY_KEYS.SEARCH.MEDICINES(debouncedQuery),
        queryFn: ({ pageParam = 1 }) => searchApi.searchMedicines(debouncedQuery, pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, totalPages } = lastPage.meta;
            return page < totalPages ? page + 1 : undefined;
        },
        enabled: debouncedQuery.length >= 1,
        staleTime: 30_000,
    });

    const results: ApiSearchMedicine[] = data?.pages.flatMap(p => p.data) ?? [];

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
        debouncedQuery,
    };
};

export const useSearchSuggestions = (query: string, limit = 8) => {
    // Debounce suggestions by 250ms — avoids firing a query on every keystroke.
    const [debouncedSuggestionQuery, setDebouncedSuggestionQuery] = useState(query);
    const suggestionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);

        if (query.trim().length < 1) {
            // Clear immediately so suggestions hide the moment input is empty
            setDebouncedSuggestionQuery('');
            return;
        }

        suggestionDebounceRef.current = setTimeout(() => {
            setDebouncedSuggestionQuery(query.trim());
        }, 250);

        return () => {
            if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);
        };
    }, [query]);

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.SEARCH.SUGGESTIONS(debouncedSuggestionQuery),
        queryFn: () => searchService.getSuggestions(debouncedSuggestionQuery, limit),
        enabled: debouncedSuggestionQuery.trim().length >= 1,
        staleTime: 5 * 60_000,
    });

    return { suggestions: data ?? [], isLoading };
};

export const useSearchHistory = (limit = 10, offset = 0) => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const queryClient = useQueryClient();

    const { data, isLoading, refetch } = useQuery({
        queryKey: QUERY_KEYS.SEARCH.HISTORY({ limit, offset }),
        queryFn: () => searchService.getHistory(limit, offset),
        enabled: isAuthenticated,
        staleTime: 5 * 60_000,
    });

    const HISTORY_KEY_PREFIX = ['search', 'history'];

    const recordMutation = useMutation({
        mutationFn: ({ query, productId }: { query: string; productId?: string }) =>
            searchService.recordHistory(query, productId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: HISTORY_KEY_PREFIX }),
    });

    const clearMutation = useMutation({
        mutationFn: () => searchService.clearHistory(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: HISTORY_KEY_PREFIX }),
    });

    const deleteItemMutation = useMutation({
        mutationFn: (id: string) => searchService.deleteHistoryItem(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: HISTORY_KEY_PREFIX }),
    });

    return {
        history: data ?? [],
        isLoading,
        refetch,
        recordHistory: (query: string, productId?: string) =>
            recordMutation.mutate({ query, productId }),
        clearHistory: () => clearMutation.mutate(),
        isClearingHistory: clearMutation.isPending,
        deleteHistoryItem: (id: string) => deleteItemMutation.mutate(id),
    };
};

export const useTrendingSearches = (limit = 6) => {
    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.SEARCH.TRENDING(limit),
        queryFn: () => searchService.getTrending(limit),
        staleTime: 30 * 60_000,
    });

    return { trending: data ?? [], isLoading };
};
