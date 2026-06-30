import { ApiSearchMedicine } from '@/src/api/search.api';
import { SearchSkeleton } from '@/src/components/search/SearchSkeleton';
import { ProductHeader } from '@/src/components/search/product/ProductHeader';
import { SearchEmptyState } from '@/src/components/search/sections/SearchEmptyState';
import { SearchRecentSection } from '@/src/components/search/sections/SearchRecentSection';
import { SearchResultsList } from '@/src/components/search/sections/SearchResultsList';
import { useCart } from '@/src/hooks/queries/useCart';
import { useSearch, useSearchHistory, useSearchSuggestions, useTrendingSearches } from '@/src/hooks/queries/useSearch';
import { LinearGradient } from 'expo-linear-gradient';
import { useNav } from '@/src/hooks/useNav';
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";

// ─── Data transformers ────────────────────────────────────────────────────────

const toComparisonData = (item: ApiSearchMedicine) => {
    const rec = item.recommendation!;
    const raw = item.mrp || item.price;
    const searchedMrp = raw != null && raw !== '' ? parseFloat(raw) : null;
    const recRaw = rec.price;
    const recPrice = recRaw != null && recRaw !== '' ? parseFloat(recRaw) : null;
    const recMrpRaw = rec.mrp || rec.price;
    const recMrp = recMrpRaw != null && recMrpRaw !== '' ? parseFloat(recMrpRaw) : null;
    const crossSavings = searchedMrp != null && recPrice != null ? parseFloat((searchedMrp - recPrice).toFixed(2)) : 0;
    const ownSavings = recMrp != null && recPrice != null && recMrp > recPrice ? parseFloat((recMrp - recPrice).toFixed(2)) : 0;
    const savings = crossSavings > 0 ? crossSavings : ownSavings;
    const buildPackLabel = (packSize?: string, unit?: string, dosageForm?: string) => {
        const base = [packSize?.trim(), unit].filter(Boolean).join(' ');
        return dosageForm ? `${base} in ${dosageForm}` : base;
    };
    const searchedPackLabel = buildPackLabel(item.packSize, item.unit, item.dosageForm);
    const recPackLabel = buildPackLabel(rec.packSize, rec.unit, rec.dosageForm);
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
            manufacturer: item.brand?.name ?? '',
            price: searchedMrp,
            status: 'Not for Purchase',
            image: item.thumbnailUrl ? { uri: item.thumbnailUrl } : undefined,
            description: searchedPackLabel,
        },
        recommended: {
            name: rec.name,
            manufacturer: '',
            price: recPrice,
            originalPrice: recMrp,
            savings: savings > 0 ? savings : 0,
            savingsPercent: rec.discountPercentage,
            description: recPackLabel,
            image: rec.thumbnailUrl ? { uri: rec.thumbnailUrl } : undefined,
        },
    };
};

// For sourceType===2 items with no recommendation found -- only derives the
// searched side, never touches item.recommendation (unlike toComparisonData,
// which assumes it exists).
const toSearchedOnlyData = (item: ApiSearchMedicine) => {
    const raw = item.mrp || item.price;
    const searchedMrp = raw != null && raw !== '' ? parseFloat(raw) : null;
    return {
        id: item.id,
        productId: item.productId,
        searched: {
            name: item.name,
            manufacturer: item.brand?.name ?? '',
            price: searchedMrp,
            status: 'Not for Purchase',
        },
    };
};

const toRecommendData = (item: ApiSearchMedicine) => ({
    id: item.id,
    productId: item.productId ?? item.id,
    name: item.name,
    manufacturer: item.brand?.name ?? '',
    packSize: item.packSize ?? '',
    unit: item.unit ?? '',
    dosageForm: item.dosageForm ?? '',
    price: item.price != null && item.price !== '' ? parseFloat(item.price) : null,
    mrp: (item.mrp || item.price) != null && (item.mrp || item.price) !== '' ? parseFloat(item.mrp || item.price) : null,
    discountPercentage: item.discountPercentage || 0,
    thumbnailUrl: item.thumbnailUrl,
});

// ─── Layout ───────────────────────────────────────────────────────────────────

export const SearchPageLayout = () => {
    const router = useNav();
    const adjustedBottom = useAdjustedBottomInset();
    const { width } = useWindowDimensions();
    const colWidth = (width - 32) / 2;

    const { totalItems: cartCount } = useCart();
    const {
        query,
        setQuery,
        results,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        debouncedQuery,
    } = useSearch();

    const { history, recordHistory, clearHistory, isClearingHistory, deleteHistoryItem } = useSearchHistory(5);
    const { suggestions } = useSearchSuggestions(query, 5);
    const { trending } = useTrendingSearches(5);

    const trendingTerms = trending.map(t => t.query);

    const isSearching = debouncedQuery.length >= 1;
    const isTyping = query.trim().length >= 1 && !isSearching;

    return (
        <View className="flex-1 bg-white">
            <LinearGradient
                colors={['#EAF7D6', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="absolute top-0 left-0 right-0 h-[110px]"
            />

            <ProductHeader
                cartCount={cartCount}
                query={query}
                onQueryChange={setQuery}
                onSubmit={() => { if (query.trim().length >= 1) recordHistory(query.trim()); }}
                isSearching={isSearching}
            />

            {!query.trim() ? (
                <SearchRecentSection
                    history={history}
                    trending={trendingTerms}
                    onTermPress={(term) => { recordHistory(term); setQuery(term); }}
                    onClear={clearHistory}
                    isClearing={isClearingHistory}
                    onDeleteHistoryItem={deleteHistoryItem}
                    onProductPress={(id) => router.push({ pathname: '/product/[id]', params: { id } })}
                    onViewAllFrequent={() => router.push('/profile/orders/frequent' as any)}
                />
            ) : isTyping ? (
                <SearchRecentSection
                    history={[]}
                    trending={suggestions}
                    onTermPress={(term) => { recordHistory(term); setQuery(term); }}
                    onClear={() => {}}
                    onDeleteHistoryItem={() => {}}
                    onProductPress={(id) => router.push({ pathname: '/product/[id]', params: { id } })}
                    showFrequent={false}
                />
            ) : isLoading ? (
                <SearchSkeleton />
            ) : results.length === 0 ? (
                <SearchEmptyState query={debouncedQuery} />
            ) : (
                <SearchResultsList
                    results={results}
                    colWidth={colWidth}
                    bottomPad={adjustedBottom + 24}
                    toComparisonData={toComparisonData}
                    toSearchedOnlyData={toSearchedOnlyData}
                    toRecommendData={toRecommendData}
                    onRecommendPress={(productId) => router.push({ pathname: '/product/[id]', params: { id: productId } } as any)}
                    onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
                    isFetchingNextPage={isFetchingNextPage}
                />
            )}

        </View>
    );
};
