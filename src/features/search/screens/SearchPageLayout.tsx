import { ApiSearchMedicine } from "@/src/features/search/types";
import { SearchSkeleton } from "@/src/features/search/SearchSkeleton";
import { ProductHeader } from "@/src/features/search/comparison/components/ProductHeader";
import { SearchEmptyState } from "@/src/features/search/sections/SearchEmptyState";
import { SearchOfflineState } from "@/src/features/search/sections/SearchOfflineState";
import { SearchRecentSection } from "@/src/features/search/sections/SearchRecentSection";
import { SearchResultsList } from "@/src/features/search/sections/SearchResultsList";
import { SearchSuggestionsBar } from "@/src/features/search/sections/SearchSuggestionsBar";
import { RetryState } from "@/src/components/ui/RetryState";
import { resolveAssetUrl } from "@/src/utils/urls";
import { useCartRead } from "@/src/features/cart/hooks/useCartRead";
import {
  useSearch,
  useSearchHistory,
  useSearchSuggestions,
  useTrendingSearches,
} from "@/src/features/search/hooks/useSearch";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { useNav } from "@/src/hooks/useNav";
import {
  analyticsService,
  PERF_TRACES,
  usePerformanceTrace,
} from "@/src/services/firebase";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, useWindowDimensions, View } from "react-native";

const toComparisonData = (item: ApiSearchMedicine) => {
  const rec = item.recommendation!;
  const raw = item.mrp || item.price;
  const searchedMrp = raw != null && raw !== "" ? parseFloat(raw) : null;
  const recRaw = rec.price;
  const recPrice = recRaw != null && recRaw !== "" ? parseFloat(recRaw) : null;
  const recMrpRaw = rec.mrp || rec.price;
  const recMrp =
    recMrpRaw != null && recMrpRaw !== "" ? parseFloat(recMrpRaw) : null;
  // Use the displayed recommendation values so savings always reconciles on screen.
  const savings =
    recMrp != null && recPrice != null && recMrp > recPrice
      ? parseFloat((recMrp - recPrice).toFixed(2))
      : 0;
  const buildPackLabel = (
    packSize?: string,
    unit?: string,
    dosageForm?: string,
    packagingDetail?: string | null,
  ) => {
    if (packagingDetail) return packagingDetail;
    const parts = [
      packSize?.trim(),
      unit,
      dosageForm ? `in ${dosageForm}` : "",
    ].filter(Boolean);
    return parts.join(" ");
  };
  const searchedPackLabel = buildPackLabel(
    item.packSize,
    item.unit,
    item.dosageForm,
    item.packagingDetail,
  );
  const recPackLabel = buildPackLabel(
    rec.packSize,
    rec.unit,
    rec.dosageForm,
    rec.packagingDetail,
  );
  return {
    id: item.id,
    productId: item.productId,
    slug: item.slug,
    requiresPrescription: item.requiresPrescription,
    recId: rec.id,
    recProductId: rec.productId,
    recSlug: rec.slug,
    searched: {
      name: item.name,
      brandName: item.brand?.name ?? "",
      price: searchedMrp,
      status: "Not for Purchase",
      image: item.thumbnailUrl
        ? { uri: resolveAssetUrl(item.thumbnailUrl) }
        : undefined,
      description: searchedPackLabel,
    },
    recommended: {
      name: rec.name,
      manufacturer: rec.manufacturer || "",
      price: recPrice,
      originalPrice: recMrp,
      savings: savings > 0 ? savings : 0,
      savingsPercent: rec.discountPercentage,
      description: recPackLabel,
      image: rec.thumbnailUrl
        ? { uri: resolveAssetUrl(rec.thumbnailUrl) }
        : undefined,
      packSize: rec.packSize,
      unit: rec.unit,
    },
  };
};

const buildPackLabel = (
  packSize?: string,
  unit?: string,
  dosageForm?: string,
  packagingDetail?: string | null,
) => {
  if (packagingDetail) return packagingDetail;
  const parts = [
    packSize?.trim(),
    unit,
    dosageForm ? `in ${dosageForm}` : "",
  ].filter(Boolean);
  return parts.join(" ");
};

// This path cannot dereference recommendation because sourceType 2 can omit it.
const toSearchedOnlyData = (item: ApiSearchMedicine) => {
  const raw = item.mrp || item.price;
  const searchedMrp = raw != null && raw !== "" ? parseFloat(raw) : null;
  return {
    id: item.id,
    productId: item.productId,
    searched: {
      name: item.name,
      manufacturer: item.brand?.name ?? "",
      price: searchedMrp,
      status: "Not for Purchase",
      description: buildPackLabel(
        item.packSize,
        item.unit,
        item.dosageForm,
        item.packagingDetail,
      ),
    },
  };
};

const toRecommendData = (item: ApiSearchMedicine) => ({
  id: item.id,
  productId: item.productId ?? item.id,
  name: item.name,
  manufacturer: item.brand?.name ?? "",
  packSize: item.packSize ?? "",
  unit: item.unit ?? "",
  dosageForm: item.dosageForm ?? "",
  packagingDetail: item.packagingDetail ?? null,
  price:
    item.price != null && item.price !== "" ? parseFloat(item.price) : null,
  mrp:
    (item.mrp || item.price) != null && (item.mrp || item.price) !== ""
      ? parseFloat(item.mrp || item.price)
      : null,
  discountPercentage: item.discountPercentage || 0,
  thumbnailUrl: item.thumbnailUrl
    ? resolveAssetUrl(item.thumbnailUrl)
    : item.thumbnailUrl,
});

export const SearchPageLayout = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { width } = useWindowDimensions();
  const colWidth = (width - 32) / 2;

  const isOffline = useIsOffline();
  const { totalItems: cartCount } = useCartRead();
  const {
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
  } = useSearch();

  // Cached results skip tracing because they do not represent network load.
  const { start: startSearchTrace, stop: stopSearchTrace } =
    usePerformanceTrace({
      traceName: PERF_TRACES.SEARCH_QUERY_LOAD,
      manualStart: true,
      maxDurationMs: 15_000,
    });
  const tracedQueryRef = useRef("");
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!isFetching || q.length === 0 || q === tracedQueryRef.current) return;
    if (tracedQueryRef.current) stopSearchTrace({ status: "superseded" });
    tracedQueryRef.current = q;
    startSearchTrace({
      query_length: String(q.length),
    });
    void analyticsService.logSearchStarted();
  }, [debouncedQuery, isFetching, startSearchTrace, stopSearchTrace]);

  useEffect(() => {
    if (tracedQueryRef.current && !isFetching) {
      stopSearchTrace(error ? { status: "error" } : { status: "success" }, {
        result_count: results.length,
      });
      if (!error) void analyticsService.logSearchCompleted(results.length);
      tracedQueryRef.current = "";
    }
  }, [error, isFetching, results.length, stopSearchTrace]);

  const {
    history,
    recordHistory,
    clearHistory,
    isClearingHistory,
    deleteHistoryItem,
  } = useSearchHistory(5);
  const { suggestions } = useSearchSuggestions(query, 6);
  const { trending } = useTrendingSearches(5);

  const trendingTerms = useMemo(() => trending.map((t) => t.query), [trending]);

  const isSearching = debouncedQuery.length >= 1;

  // Related Search hides once the user has committed to a query (submit or a
  // suggestion tap) and reappears the moment they edit the query again.
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      setSuggestionsDismissed(false);
    },
    [setQuery],
  );

  // Stable handlers keep the results list and its rows out of the per-keystroke render.
  const handleSubmit = useCallback(() => {
    const term = query.trim();
    if (term.length >= 1) {
      Keyboard.dismiss();
      setSuggestionsDismissed(true);
      recordHistory(term);
    }
  }, [query, recordHistory]);

  const handleTermPress = useCallback(
    (term: string) => {
      Keyboard.dismiss();
      setSuggestionsDismissed(true);
      recordHistory(term);
      setQuery(term);
    },
    [recordHistory, setQuery],
  );

  const handleProductPress = useCallback(
    (
      id: string,
      previewName?: string,
      previewImage?: string,
      previewBrand?: string,
    ) =>
      router.push({
        pathname: "/product/[id]",
        params: {
          id,
          previewName: previewName || undefined,
          previewImage: previewImage || undefined,
          previewBrand: previewBrand || undefined,
        },
      }),
    [router],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#EAF7D6", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute top-0 left-0 right-0 h-[110px]"
      />

      <ProductHeader
        cartCount={cartCount}
        query={query}
        onQueryChange={handleQueryChange}
        onSubmit={handleSubmit}
        isSearching={isSearching}
      />

      {isOffline ? (
        <SearchOfflineState />
      ) : !query.trim() ? (
        <SearchRecentSection
          key="idle"
          history={history}
          trending={trendingTerms}
          onTermPress={handleTermPress}
          onClear={clearHistory}
          isClearing={isClearingHistory}
          onDeleteHistoryItem={deleteHistoryItem}
          onProductPress={handleProductPress}
        />
      ) : (
        <View className="flex-1">
          {!suggestionsDismissed && query.trim().length >= 2 && (
            <SearchSuggestionsBar
              suggestions={suggestions}
              onSelect={handleTermPress}
            />
          )}

          {isLoading ? (
            <SearchSkeleton />
          ) : error && results.length === 0 ? (
            <RetryState
              title="Search unavailable"
              message="We couldn't load search results. Please try again."
              onRetry={() => void refetch()}
              retrying={isFetching}
            />
          ) : !isSearching ? null : results.length === 0 ? (
            <SearchEmptyState query={debouncedQuery} />
          ) : (
            <SearchResultsList
              results={results}
              colWidth={colWidth}
              bottomPad={adjustedBottom + 24}
              toComparisonData={toComparisonData}
              toSearchedOnlyData={toSearchedOnlyData}
              toRecommendData={toRecommendData}
              onRecommendPress={handleProductPress}
              onEndReached={handleEndReached}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}
        </View>
      )}
    </View>
  );
};
