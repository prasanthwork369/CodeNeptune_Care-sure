import { ApiSearchMedicine } from '@/src/api/search.api';
import { SearchProductCard } from '@/src/components/search/SearchProductCard';
import { SearchRecommendCard } from '@/src/components/search/SearchRecommendCard';
import { SearchColumnHeaders } from './SearchColumnHeaders';
import React from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

export const SearchResultsList = ({
    results,
    colWidth,
    bottomPad,
    toComparisonData,
    toRecommendData,
    onRecommendPress,
    onEndReached,
    isFetchingNextPage,
}: {
    results: ApiSearchMedicine[];
    colWidth: number;
    bottomPad: number;
    toComparisonData: (item: ApiSearchMedicine) => any;
    toRecommendData: (item: ApiSearchMedicine) => any;
    onRecommendPress: (productId: string) => void;
    onEndReached: () => void;
    isFetchingNextPage: boolean;
}) => (
    <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        className="flex-1"
        ListHeaderComponent={<SearchColumnHeaders colWidth={colWidth} />}
        renderItem={({ item }) => (
            <View className="px-4">
                {item.sourceType === 2 && item.recommendation ? (
                    <SearchProductCard data={toComparisonData(item)} />
                ) : (
                    <SearchRecommendCard data={toRecommendData(item)} onPress={onRecommendPress} />
                )}
            </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
            isFetchingNextPage
                ? <ActivityIndicator size="small" color="#0F7635" style={{ marginVertical: 12 }} />
                : null
        }
    />
);
