import { Skeleton } from "@/src/components/ui/Skeleton";
import type { CategoryProduct } from "@/src/features/categories/types";
import { moderateScale } from "@/src/utils/exactScale";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
import React, { useCallback, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { CategoryProductCard } from "./CategoryProductCard";

const GRID_PADDING = 16;
const GRID_GAP = 10;
// Half the gap lives on each cell, so the outer edge still lands on GRID_PADDING.
const CELL_GAP = GRID_GAP / 2;

interface ProductGridProps {
  products: CategoryProduct[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onProductPress: (product: CategoryProduct) => void;
  paddingBottom: number;
}

/** Two-column product grid shared by the category and featured screens. */
export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  isRefreshing,
  onRefresh,
  onProductPress,
  paddingBottom,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

  // Guards against a second pull-to-refresh firing while one is already in
  // flight — RefreshControl's own `refreshing` prop reflects the real query
  // state below, but this is a belt-and-braces check against duplicate calls.
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

  const keyExtractor = useCallback((item: CategoryProduct) => item.id, []);

  if (isLoading) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: GRID_PADDING, paddingBottom }}
      >
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={{ width: cardWidth }} className="mb-6">
              <Skeleton
                width={cardWidth}
                height={cardWidth * 1.05}
                borderRadius={14}
              />
              <View className="mt-2 gap-y-2">
                <Skeleton
                  width={cardWidth * 0.4}
                  height={28}
                  borderRadius={6}
                />
                <Skeleton
                  width={cardWidth * 0.9}
                  height={14}
                  borderRadius={4}
                />
                <Skeleton
                  width={cardWidth * 0.6}
                  height={12}
                  borderRadius={4}
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
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: GRID_PADDING - CELL_GAP,
        paddingTop: GRID_PADDING,
        paddingBottom,
      }}
      refreshControl={refreshControl}
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center py-20">
          <Text
            className="font-inter-medium text-brand-subtext"
            style={{ fontSize: moderateScale(15) }}
          >
            No products found
          </Text>
        </View>
      }
    />
  );
};
