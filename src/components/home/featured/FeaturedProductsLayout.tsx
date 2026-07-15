import {
  FlyToCartOverlay,
  FlyToCartProvider,
} from "@/src/components/animations/flyToCart";
import { CategoryCartBanner, CategoryProductCard } from "@/src/components/categories/products/sections";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useCart } from "@/src/hooks/queries/useCart";
import { useAllFeaturedMedicines } from "@/src/hooks/queries/useFeaturedMedicines";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import type { CategoryProduct } from "@/src/types/category";
import type { Product } from "@/src/types/home";
import { moderateScale } from "@/src/utils/exactScale";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const GRID_PADDING = 16;
const GRID_GAP = 10;

// The featured endpoint has no paging, so the page asks for a larger limit and
// shows everything it returns.
const FEATURED_LIMIT = 50;

// The grid card takes CategoryProduct; the featured hook returns the home
// Product shape. The fields line up — this just renames them.
const toCategoryProduct = (p: Product): CategoryProduct => ({
  id: p.id,
  productId: p.productId ?? p.id,
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
  const { width } = useWindowDimensions();
  const { totalItems } = useCart();
  const { products, isLoading, refetch } = useAllFeaturedMedicines(FEATURED_LIMIT);

  const cardWidth = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="More Affordable Choices" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: GRID_PADDING,
          paddingTop: 16,
          paddingBottom: adjustedBottom + 100,
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
                  <Skeleton width={cardWidth * 0.4} height={28} borderRadius={6} />
                  <Skeleton width={cardWidth * 0.9} height={14} borderRadius={4} />
                  <Skeleton width={cardWidth * 0.6} height={12} borderRadius={4} />
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
                product={toCategoryProduct(item)}
                cardWidth={cardWidth}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: item.productId ?? item.id },
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

export const FeaturedProductsLayout: React.FC = () => (
  <FlyToCartProvider>
    <FeaturedProductsContent />
  </FlyToCartProvider>
);
