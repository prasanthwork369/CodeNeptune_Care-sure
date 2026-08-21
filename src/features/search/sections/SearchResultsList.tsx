import { ApiSearchMedicine } from "@/src/features/search/types";
import { SearchNoSubstituteCard } from "@/src/features/search/SearchNoSubstituteCard";
import { SearchProductCard } from "@/src/features/search/SearchProductCard";
import { SearchRecommendCard } from "@/src/features/search/SearchRecommendCard";
import { SOURCE_TYPE } from "@/src/constants/source-type";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
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

type SearchDataItem = { type: "comparison-header" } | ApiSearchMedicine;

// Single source of truth for cell shape — used for both FlashList's recycling
// (getItemType) and renderItem's branching, so the two can't drift out of sync.
const resolveItemType = (
  item: SearchDataItem,
): "header" | "comparison" | "no-substitute" | "recommend" => {
  if ("type" in item) return "header";
  if (item.sourceType === SOURCE_TYPE.COMPARABLE) {
    return item.recommendation ? "comparison" : "no-substitute";
  }
  return "recommend";
};

export const SearchResultsList = React.memo(
  ({
    results,
    colWidth,
    bottomPad,
    toComparisonData,
    toSearchedOnlyData,
    toRecommendData,
    onRecommendPress,
    onBeforeProductNavigate,
    onEndReached,
    isFetchingNextPage,
    onScrollBeginDrag,
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
    // SearchProductCard and SearchNoSubstituteCard push to their own product
    // route directly instead of going through onRecommendPress — this runs
    // right before that push so the keyboard/suggestions get torn down the
    // same way for every card type.
    onBeforeProductNavigate?: () => void;
    onEndReached: () => void;
    isFetchingNextPage: boolean;
    // Fired once when the user's finger starts dragging the list — not on
    // every onScroll frame, and not for a tap (RN's own touch-slop already
    // filters those out before this fires).
    onScrollBeginDrag?: () => void;
  }) => {
    const hasComparisonRows = useMemo(
      () =>
        results.some(
          (item) =>
            item.sourceType === SOURCE_TYPE.COMPARABLE && item.recommendation,
        ),
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
        // Narrows item to ApiSearchMedicine for everything below — the same
        // check resolveItemType uses internally to decide "header".
        if ("type" in item) {
          return <SearchColumnHeaders colWidth={colWidth} />;
        }

        switch (resolveItemType(item)) {
          case "comparison":
            return (
              <View className="px-4">
                <SearchProductCard
                  data={toComparisonData(item)}
                  onBeforeNavigate={onBeforeProductNavigate}
                />
              </View>
            );
          case "no-substitute":
            return (
              <View className="px-4">
                <SearchNoSubstituteCard
                  data={toSearchedOnlyData(item)}
                  onBeforeNavigate={onBeforeProductNavigate}
                />
              </View>
            );
          default:
            return (
              <View className="px-4">
                <SearchRecommendCard
                  data={toRecommendData(item)}
                  onPress={onRecommendPress}
                />
              </View>
            );
        }
      },
      [
        colWidth,
        toComparisonData,
        toSearchedOnlyData,
        toRecommendData,
        onRecommendPress,
        onBeforeProductNavigate,
      ],
    );

    const contentStyle = useMemo(
      () => ({ paddingBottom: bottomPad }),
      [bottomPad],
    );

    return (
      <AppFlashList
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
        getItemType={resolveItemType}
        // Wider pre-render buffer beyond the viewport (default 250) so cells
        // are already measured/mounted before a fast fling reaches them.
        drawDistance={1200}
        renderItem={renderItem}
        onScrollBeginDrag={onScrollBeginDrag}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={isFetchingNextPage ? ListFooter : null}
      />
    );
  },
);

SearchResultsList.displayName = "SearchResultsList";
