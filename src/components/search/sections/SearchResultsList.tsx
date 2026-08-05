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
    // Each mapper must produce exactly what the card it feeds expects.
    toComparisonData: (
      item: ApiSearchMedicine,
    ) => React.ComponentProps<typeof SearchProductCard>["data"];
    toSearchedOnlyData: (
      item: ApiSearchMedicine,
    ) => React.ComponentProps<typeof SearchNoSubstituteCard>["data"];
    toRecommendData: (
      item: ApiSearchMedicine,
    ) => React.ComponentProps<typeof SearchRecommendCard>["data"];
    onRecommendPress: (productId: string) => void;
    onEndReached: () => void;
    isFetchingNextPage: boolean;
  }) => {
    type SearchDataItem = { type: "comparison-header" } | ApiSearchMedicine;

    const hasComparisonRows = useMemo(
      () =>
        results.some((item) => item.sourceType === 2 && item.recommendation),
      [results],
    );

    const data = useMemo<SearchDataItem[]>(
      () =>
        hasComparisonRows
          ? [{ type: "comparison-header" }, ...results]
          : results,
      [hasComparisonRows, results],
    );

    const renderItem = useCallback(
      ({ item }: { item: SearchDataItem }) => {
        if ("type" in item) {
          return <SearchColumnHeaders colWidth={colWidth} />;
        }

        return (
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
        );
      },
      [
        colWidth,
        toComparisonData,
        toSearchedOnlyData,
        toRecommendData,
        onRecommendPress,
      ],
    );

    const contentStyle = useMemo(
      () => ({ paddingBottom: bottomPad }),
      [bottomPad],
    );

    return (
      <FlashList
        data={data}
        keyExtractor={(item) =>
          "type" in item ? "comparison-header" : keyExtractor(item)
        }
        showsVerticalScrollIndicator={false}
        // Without this the keyboard swallows the first tap on a card, so the
        // user has to press twice to open the product.
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={contentStyle}
        className="flex-1"
        stickyHeaderIndices={hasComparisonRows ? [0] : undefined}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isFetchingNextPage ? ListFooter : null}
      />
    );
  },
);

SearchResultsList.displayName = "SearchResultsList";
