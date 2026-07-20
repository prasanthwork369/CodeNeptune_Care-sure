import {
  FlyToCartOverlay,
  FlyToCartProvider,
} from "@/src/components/animations/flyToCart";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/hooks/queries/useCart";
import { useCategoryProducts } from "@/src/hooks/queries/useCategories";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { moderateScale } from "@/src/utils/exactScale";
import { useLocalSearchParams } from "expo-router";
import { PERF_TRACES, usePerformanceTrace } from "@/src/services/firebase";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { CategoryCartBanner, CategoryProductCard } from "./sections";

const GRID_PADDING = 16;
const GRID_GAP = 10;

const CategoryProductsContent: React.FC = () => {
  const { slug, name, familySlug } = useLocalSearchParams<{
    slug: string;
    name: string;
    familySlug?: string;
  }>();
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { width } = useWindowDimensions();
  const { totalItems } = useCart();

  const { products, isLoading, refetch } = useCategoryProducts({
    categorySlug: familySlug || slug,
    subCategorySlug: familySlug ? slug : undefined,
  });

  usePerformanceTrace({
    traceName: PERF_TRACES.PRODUCT_LIST_LOAD,
    isLoading: isLoading,
  });

  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title={name || "Category"}
        rightSlot={
          <View className="flex-row items-center gap-2.5">
            <Touchable
              onPress={() => router.push("/search")}
              className="w-12 h-12 rounded-full bg-white border border-[#919EAB33] items-center justify-center "
            >
              <icons.search width={20} height={20} />
            </Touchable>
            <View className="relative">
              <Touchable
                onPress={() => router.push("/(stack)/cart")}
                className="w-12 h-12 rounded-full bg-white border border-[#919EAB33] items-center justify-center "
              >
                <icons.cart_outline width={22} height={22} />
              </Touchable>
              {totalItems > 0 && (
                <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C22923] items-center justify-center">
                  <Text
                    className="font-inter-bold text-white"
                    style={{ fontSize: moderateScale(10) }}
                  >
                    {totalItems}
                  </Text>
                </View>
              )}
            </View>
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: GRID_PADDING,
          paddingBottom:
            totalItems > 0 ? adjustedBottom + 90 : adjustedBottom + 24,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor="#36B37E"
            colors={["#36B37E"]}
          />
        }
      >
        {isLoading ? (
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
        ) : products.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text
              className="font-inter-medium text-brand-subtext"
              style={{ fontSize: moderateScale(15) }}
            >
              No products found
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {products.map((item) => (
              <CategoryProductCard
                key={item.id}
                product={item}
                cardWidth={cardWidth}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: item.productId },
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View
        pointerEvents={totalItems > 0 ? "box-none" : "none"}
        style={{
          position: "absolute",
          bottom: adjustedBottom + 20,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <CategoryCartBanner onPress={() => router.push("/(stack)/cart")} />
      </View>
      <FlyToCartOverlay />
    </View>
  );
};

export const CategoryProductsLayout: React.FC = () => {
  return (
    <FlyToCartProvider>
      <CategoryProductsContent />
    </FlyToCartProvider>
  );
};
