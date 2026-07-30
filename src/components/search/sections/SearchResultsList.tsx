import { ApiSearchMedicine } from "@/src/api/search.api";
import { SearchNoSubstituteCard } from "@/src/components/search/SearchNoSubstituteCard";
import { SearchProductCard } from "@/src/components/search/SearchProductCard";
import { SearchRecommendCard } from "@/src/components/search/SearchRecommendCard";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { SearchColumnHeaders } from "./SearchColumnHeaders";

const ListFooter = () => (
  <ActivityIndicator
    size="small"
    color="#0F7635"
    style={{ marginVertical: 12 }}
  />
);

const keyExtractor = (item: ApiSearchMedicine) => item.id;

export const SearchResultsList = React.memo(
  ({
    results,
    colWidth,
    bottomPad,
    toComparisonData,
    toSearchedOnlyData,
    toRecommendData,
    onRecommendPress,
    onEndReached,
    isFetchingNextPage,
  }: {
    results: ApiSearchMedicine[];
    colWidth: number;
    bottomPad: number;
    toComparisonData: (item: ApiSearchMedicine) => any;
    toSearchedOnlyData: (item: ApiSearchMedicine) => any;
    toRecommendData: (item: ApiSearchMedicine) => any;
    onRecommendPress: (productId: string) => void;
    onEndReached: () => void;
    isFetchingNextPage: boolean;
  }) => {
    const renderItem = useCallback(
      ({ item }: { item: ApiSearchMedicine }) => (
        <View className="px-4">
          {item.sourceType === 2 ? (
            item.recommendation ? (
              <SearchProductCard data={toComparisonData(item)} />
            ) : (
              <SearchNoSubstituteCard data={toSearchedOnlyData(item)} />
            )
          ) : (
            <SearchRecommendCard
              data={toRecommendData(item)}
              onPress={onRecommendPress}
            />
          )}
        </View>
      ),
      [toComparisonData, toSearchedOnlyData, toRecommendData, onRecommendPress],
    );

    // Hoisted out of the render pass so typing does not rebuild the gradient-SVG header on every keystroke.
    const listHeader = useMemo(
      () => <SearchColumnHeaders colWidth={colWidth} />,
      [colWidth],
    );
    const contentStyle = useMemo(
      () => ({ paddingBottom: bottomPad }),
      [bottomPad],
    );

    return (
      <FlashList
        data={results}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentStyle}
        className="flex-1"
        ListHeaderComponent={listHeader}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isFetchingNextPage ? ListFooter : null}
      />
    );
  },
);

SearchResultsList.displayName = "SearchResultsList";
