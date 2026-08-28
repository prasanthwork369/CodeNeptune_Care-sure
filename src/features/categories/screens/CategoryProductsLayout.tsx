import {
  FlyToCartOverlay,
  FlyToCartProvider,
} from "@/src/components/animations/flyToCart";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCartRead } from "@/src/features/cart/hooks/useCartRead";
import {
  useCategories,
  useCategoryProducts,
} from "@/src/features/categories/hooks/useCategories";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import type { CategoryProduct } from "@/src/features/categories/types";
import { exactScale } from "@/src/utils/exactScale";
import { useLocalSearchParams } from "expo-router";
import { PERF_TRACES, usePerformanceTrace } from "@/src/services/firebase";
import React, { useCallback } from "react";
import { Text, View } from "react-native";
import {
  CategoryCartBanner,
  ProductGrid,
} from "@/src/features/categories/products/sections";
import { styles as s } from "./CategoryProductsLayout.styles";

const CategoryProductsContent: React.FC = () => {
  const { id, slug, name, familySlug } = useLocalSearchParams<{
    id?: string;
    slug: string;
    name: string;
    familySlug?: string;
  }>();
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { totalItems, cartLineCount } = useCartRead();
  const { families } = useCategories();

  const resolvedFamilySlug =
    familySlug ||
    families.find(
      (f) =>
        f.slug === slug ||
        f.subCategories?.some((s) => s.slug === slug || (id && s.id === id)),
    )?.slug ||
    slug;
  const resolvedSubCategorySlug =
    resolvedFamilySlug !== slug ? slug : undefined;

  const { products, isLoading, isRefetching, error, refetch } =
    useCategoryProducts({
      categorySlug: resolvedFamilySlug,
      subCategorySlug: resolvedSubCategorySlug,
    });

  usePerformanceTrace({
    traceName: PERF_TRACES.PRODUCT_LIST_LOAD,
    isLoading: isLoading,
  });

  // Stable, so the memoized cards don't re-render on every grid render.
  const handleProductPress = useCallback(
    (product: CategoryProduct) => {
      const previewImage =
        typeof product.image === "string"
          ? product.image
          : (product.image as { uri?: string } | undefined)?.uri;
      router.push({
        pathname: "/product/[id]",
        params: {
          id: product.productId,
          previewName: product.name,
          previewImage: previewImage || undefined,
          previewBrand: product.brand || undefined,
        },
      });
    },
    [router],
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View style={s.root}>
      <ScreenHeader
        title={name || "Category"}
        rightSlot={
          <View style={s.headerRightRow}>
            <Touchable
              onPress={() => router.push("/search")}
              style={s.actionButton}
            >
              <icons.search width={exactScale(20)} height={exactScale(20)} />
            </Touchable>
            <View style={s.cartWrap}>
              <Touchable
                onPress={() => router.push("/(commerce)/cart")}
                style={s.actionButton}
              >
                <icons.cart_outline width={exactScale(22)} height={exactScale(22)} />
              </Touchable>
              {cartLineCount > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>
                    {cartLineCount}
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
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        onProductPress={handleProductPress}
        error={error}
        paddingBottom={
          totalItems > 0 ? adjustedBottom + 90 : adjustedBottom + 24
        }
      />

      <View
        pointerEvents={totalItems > 0 ? "box-none" : "none"}
        style={[
          s.floatingBannerWrap,
          {
            bottom: adjustedBottom + exactScale(20),
          },
        ]}
      >
        <CategoryCartBanner onPress={() => router.push("/(commerce)/cart")} />
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
