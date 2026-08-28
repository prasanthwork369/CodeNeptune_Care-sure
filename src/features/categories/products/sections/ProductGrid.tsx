import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { Skeleton } from "@/src/components/ui/Skeleton";
import type { CategoryProduct } from "@/src/features/categories/types";
import { exactScale } from "@/src/utils/exactScale";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import React, { useCallback, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { CategoryProductCard } from "./CategoryProductCard";
import { styles as s } from "./ProductGrid.styles";

const GRID_PADDING = exactScale(16);
const GRID_GAP = exactScale(10);
// Half the gap lives on each cell, so the outer edge still lands on GRID_PADDING.
const CELL_GAP = GRID_GAP / 2;

const keyExtractor = (item: CategoryProduct) => item.id;
const getItemType = () => "product";

interface ProductGridProps {
  products: CategoryProduct[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onProductPress: (product: CategoryProduct) => void;
  paddingBottom: number;
  error?: unknown;
}

/** Two-column product grid shared by the category and featured screens. */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  isRefreshing,
  onRefresh,
  onProductPress,
  paddingBottom,
  error,
}) => {
  const { width } = useWindowDimensions();
  const errorState = useQueryErrorState(error);
  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    onRefresh();
  }, [isRefreshing, onRefresh]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        tintColor="#36B37E"
        colors={["#36B37E"]}
      />
    ),
    [isRefreshing, handleRefresh],
  );

  const renderItem = useCallback(
    ({ item }: { item: CategoryProduct }) => (
      <View style={{ paddingHorizontal: CELL_GAP }}>
        <CategoryProductCard
          product={item}
          cardWidth={cardWidth}
          onPress={onProductPress}
        />
      </View>
    ),
    [cardWidth, onProductPress],
  );

  if (products.length === 0 && errorState === "offline") {
    return <NoInternetState onRetry={onRefresh} retrying={isRefreshing} />;
  }

  if (products.length === 0 && errorState === "server") {
    return <RetryState onRetry={onRefresh} retrying={isRefreshing} />;
  }

  if (isLoading) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: GRID_PADDING, paddingBottom }}
      >
        <View style={s.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[s.skeletonItem, { width: cardWidth }]}>
              <Skeleton
                width={cardWidth}
                height={cardWidth * 1.05}
                borderRadius={exactScale(14)}
              />
              <View style={s.skeletonDetails}>
                <Skeleton
                  width={cardWidth * 0.4}
                  height={exactScale(28)}
                  borderRadius={exactScale(6)}
                />
                <Skeleton
                  width={cardWidth * 0.9}
                  height={exactScale(14)}
                  borderRadius={exactScale(4)}
                />
                <Skeleton
                  width={cardWidth * 0.6}
                  height={exactScale(12)}
                  borderRadius={exactScale(4)}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <AppFlashList
      data={products}
      numColumns={2}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      drawDistance={1200}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: GRID_PADDING - CELL_GAP,
        paddingTop: GRID_PADDING,
        paddingBottom,
      }}
      refreshControl={refreshControl}
      ListEmptyComponent={
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>
            No products found
          </Text>
        </View>
      }
    />
  );
};
ProductGrid.displayName = "ProductGrid";
