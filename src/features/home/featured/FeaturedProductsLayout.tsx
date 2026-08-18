import {
  FlyToCartOverlay,
  FlyToCartProvider,
} from "@/src/components/animations/flyToCart";
import {
  CategoryCartBanner,
  ProductGrid,
} from "@/src/features/categories/products/sections";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { useCartRead } from "@/src/features/cart/hooks/useCartRead";
import { useAllFeaturedMedicines } from "@/src/features/product/hooks/useFeaturedMedicines";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import type { CategoryProduct } from "@/src/features/categories/types";
import type { Product } from "@/src/features/product/types";
import React, { useCallback, useMemo } from "react";
import { View } from "react-native";

// The featured endpoint has no paging, so the page asks for a larger limit and
// shows everything it returns.
const FEATURED_LIMIT = 50;

// The grid card takes CategoryProduct; the featured hook returns the home
// Product shape. The fields line up — this just renames them.
const toCategoryProduct = (p: Product): CategoryProduct => ({
  id: p.id,
  // No `?? p.id` fallback: that is the medicine id, and the product detail
  // route resolves product ids only. Falling back navigated to "no product
  // found" instead of simply doing nothing.
  productId: p.productId ?? "",
  slug: p.slug ?? "",
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice,
  description: p.description,
  image: p.image,
  discount: p.discount,
  discountPercent: p.discountPercent,
  packSize: p.packSize,
  unit: p.unit,
});

const FeaturedProductsContent: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { totalItems } = useCartRead();
  const { products, isLoading, isRefetching, refetch } =
    useAllFeaturedMedicines(FEATURED_LIMIT);

  const gridProducts = useMemo(
    () => products.map(toCategoryProduct),
    [products],
  );

  // Stable, so the memoized cards don't re-render on every grid render.
  const handleProductPress = useCallback(
    (product: CategoryProduct) => {
      // An item without a productId cannot resolve — inert beats a dead screen.
      if (!product.productId) return;
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
        },
      });
    },
    [router],
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="More Affordable Choices" />

      <ProductGrid
        products={gridProducts}
        isLoading={isLoading}
        isRefreshing={isRefetching}
        onRefresh={handleRefresh}
        onProductPress={handleProductPress}
        paddingBottom={adjustedBottom + 100}
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
        <CategoryCartBanner onPress={() => router.push("/(commerce)/cart")} />
      </View>
      <FlyToCartOverlay />
    </View>
  );
};

export const FeaturedProductsLayout: React.FC = () => (
  <FlyToCartProvider>
    <FeaturedProductsContent />
  </FlyToCartProvider>
);
