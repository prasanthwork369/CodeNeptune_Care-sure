import {
  FlyToCartOverlay,
  FlyToCartProvider,
} from "@/src/components/animations/flyToCart";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCartRead } from "@/src/hooks/queries/useCartRead";
import { useCategoryProducts } from "@/src/hooks/queries/useCategories";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import type { CategoryProduct } from "@/src/types/category";
import { moderateScale } from "@/src/utils/exactScale";
import { useLocalSearchParams } from "expo-router";
import { PERF_TRACES, usePerformanceTrace } from "@/src/services/firebase";
import React, { useCallback } from "react";
import { Text, View } from "react-native";
import {
  CategoryCartBanner,
  ProductGrid,
} from "@/src/features/categories/products/sections";

const CategoryProductsContent: React.FC = () => {
  const { slug, name, familySlug } = useLocalSearchParams<{
    slug: string;
    name: string;
    familySlug?: string;
  }>();
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { totalItems } = useCartRead();

  const { products, isLoading, refetch } = useCategoryProducts({
    categorySlug: familySlug || slug,
    subCategorySlug: familySlug ? slug : undefined,
  });

  usePerformanceTrace({
    traceName: PERF_TRACES.PRODUCT_LIST_LOAD,
    isLoading: isLoading,
  });

  // Stable, so the memoized cards don't re-render on every grid render.
  const handleProductPress = useCallback(
    (product: CategoryProduct) => {
      router.push({
        pathname: "/product/[id]",
        params: { id: product.productId },
      });
    },
    [router],
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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
      <ProductGrid
        products={products}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onProductPress={handleProductPress}
        paddingBottom={
          totalItems > 0 ? adjustedBottom + 90 : adjustedBottom + 24
        }
      />

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
