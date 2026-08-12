import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { HOME_IMAGES } from "@/src/constants/images";
import { useCartActions } from "@/src/hooks/useCartActions";
import type { Product } from "@/src/types/home";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { HomeProductCardSkeleton } from "./HomeProductCardSkeleton";
import { ViewAllCard } from "./ViewAllCard";
import { styles as s } from "./PopularSubstitutes.styles";
import { exactScale } from "@/src/utils/exactScale";

interface PopularSubstitutesProps {
  products: Product[];
  isLoading?: boolean;
  onProductPress?: (id: string) => void;
  onViewAll?: () => void;
  /** Catalogue size from the backend; the subtitle is hidden without it. */
  totalCount?: number;
}

const ACCENT = "#0F7635";
const CONTENT_BG = "#F7FDF9";
const DISCOUNT_BG = "#E8F5E9";
const ROW_GAP = exactScale(14);

// Hoisted: an inline arrow is a new component type every render, which remounts
// every separator in the row instead of reusing them.
const ProductSeparator = () => <View style={{ width: ROW_GAP }} />;

const ProductCard = React.memo(
  ({
    product,
    cardWidth,
    onProductPress,
    onLayout,
  }: {
    product: Product;
    cardWidth: number;
    onProductPress?: (id: string) => void;
    onLayout?: (e: LayoutChangeEvent) => void;
  }) => {
    // Image area height is tied to card width (so the image proportion matches
    // the design); the details area below it is NOT forced into a matching
    // half-split -- it sizes itself to its actual text/button content instead,
    // so it can't end up taller (huge empty gap) or shorter (squeezed/no gap)
    // than what the content needs on any given screen width.
    const imageAreaHeight = cardWidth * 0.875;
    const imageSize = imageAreaHeight * 0.65;

    // Add-to-cart mirrors the web ProductCard: the card shows the base price
    // (below), but the cart receives the default variant (variant[0]) when the
    // API expands one. Keyed by the variant UUID like the mobile PDP, so adding
    // the same variant here or on the PDP lands in one cart row. Falls back to
    // the base medicine when no variant is present.
    const v = product.defaultVariant;
    const cartMedicineId = v ? v.id : product.id;
    const { count, increment, decrement, animations, isPending } =
      useCartActions(
        v
          ? {
              medicineId: v.id,
              baseMedicineId: product.id,
              variantId: v.id,
              productId: product.productId,
              name: product.name,
              slug: product.slug,
              price: v.sellingPrice,
              originalPrice: v.mrp,
              discountPercent: v.discountPercent,
              packSize: v.packSize,
              unit: v.unit,
              image: product.image,
              requiresPrescription: product.requiresPrescription,
            }
          : {
              medicineId: product.id,
              variantId: null,
              productId: product.productId,
              name: product.name,
              slug: product.slug,
              price: product.price as number,
              originalPrice: product.originalPrice,
              discountPercent: product.discountPercent,
              image: product.image,
              requiresPrescription: product.requiresPrescription,
              packSize: product.packSize,
              unit: product.unit,
            },
      );
    const { slideAnim, opacityAnim } = animations;

    const { imageRef, triggerFly } = useFlyToCartTrigger(
      product.image,
      cartMedicineId,
    );

    const handleAdd = useCallback(async () => {
      // Only animate on a confirmed add: offline the increment refuses and a
      // fly-in would falsely show the item landing in the cart.
      const added = await increment();
      if (added) triggerFly();
    }, [increment, triggerFly]);

    return (
      <View
        className="bg-white rounded-[12px] overflow-hidden"
        style={{
          width: cardWidth,
          borderWidth: 0.77,
          borderColor: "#919EAB33",
        }}
        onLayout={onLayout}
      >
        {/* Image area — fixed height, tied to card width */}
        <Touchable
          activeOpacity={0.85}
          onPress={() => {
            // productId only: the medicine id cannot resolve on the product route.
            if (!product.productId) return;
            onProductPress?.(product.productId);
          }}
          style={{
            height: imageAreaHeight,
            backgroundColor: CONTENT_BG,
            paddingBottom: exactScale(4),
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              ref={imageRef}
              collapsable={false}
              style={{ width: imageSize, height: imageSize }}
            >
              <Image
                source={product.image}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
          </View>
          {!!product.discount && (
            <View style={[s.badgeContainer, { backgroundColor: DISCOUNT_BG }]}>
              <Text style={[s.badge, { color: ACCENT, fontWeight: "800" }]}>
                {product.discount}
              </Text>
            </View>
          )}
        </Touchable>

        {/* Details area — sized to its own content, not a forced half-split */}
        <View
          style={{
            backgroundColor: CONTENT_BG,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            paddingHorizontal: exactScale(12),
            paddingTop: exactScale(12),
            flexDirection: "column",
          }}
        >
          <Touchable
            activeOpacity={0.85}
            onPress={() => {
              // productId only: the medicine id cannot resolve on the product route.
              if (!product.productId) return;
              onProductPress?.(product.productId);
            }}
          >
            <Text style={s.name} className="text-brand-text" numberOfLines={1}>
              {product.name}
            </Text>
            {!!product.description && (
              <Text style={s.description} className="mt-0.5" numberOfLines={1}>
                {product.description}
              </Text>
            )}
            <View
              className="flex-row items-center gap-x-1.5 mt-1.5"
              style={{ marginBottom: exactScale(8) }}
            >
              <Text style={s.price}>₹{Number(product.price).toFixed(2)}</Text>
              {!!product.originalPrice &&
                product.originalPrice > product.price && (
                  <Text style={s.mrp}>
                    ₹{Number(product.originalPrice).toFixed(2)}
                  </Text>
                )}
            </View>
          </Touchable>

          {/* Button — fixed padding top & bottom, always at bottom */}
          <View
            style={{
              paddingTop: exactScale(6),
              paddingBottom: exactScale(12),
              alignItems: "center",
            }}
          >
            {count === 0 ? (
              <Touchable
                onPress={handleAdd}
                disabled={isPending}
                activeOpacity={0.85}
                style={s.cartBtn}
              >
                <Text style={s.addBtn}>
                  {isPending ? "Adding..." : "Add to Cart"}
                </Text>
              </Touchable>
            ) : (
              <View style={s.cartBtnActive}>
                <Touchable
                  onPress={decrement}
                  disabled={isPending}
                  activeOpacity={0.7}
                  className="w-9 h-9 items-center justify-center"
                >
                  <Text
                    style={s.counter}
                    className="font-inter-medium text-white leading-none"
                  >
                    −
                  </Text>
                </Touchable>
                <View
                  style={{
                    width: exactScale(24),
                    height: exactScale(24),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Animated.Text
                      className="font-inter-bold text-white text-center"
                      style={[
                        s.counterVal,
                        {
                          transform: [{ translateY: slideAnim }],
                          opacity: opacityAnim,
                        },
                      ]}
                    >
                      {count}
                    </Animated.Text>
                  )}
                </View>
                <Touchable
                  onPress={handleAdd}
                  disabled={isPending}
                  activeOpacity={0.7}
                  className="w-9 h-9 items-center justify-center"
                >
                  <Text
                    style={s.counter}
                    className="font-inter-medium text-white leading-none"
                  >
                    +
                  </Text>
                </Touchable>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  },
);
ProductCard.displayName = "PopularSubstitutesProductCard";

export const PopularSubstitutes: React.FC<PopularSubstitutesProps> = ({
  products,
  isLoading,
  onProductPress,
  onViewAll,
  totalCount,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 20 - 14 - 36) / 2;
  // Product cards size to their own content (see ProductCard), so there is no
  // fixed height to copy — measure a real one and match it.
  const [rowHeight, setRowHeight] = useState(0);

  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard
        product={item}
        cardWidth={cardWidth}
        onProductPress={onProductPress}
        // Measure one real card; the View All card then matches it.
        onLayout={
          index === 0
            ? (e) => setRowHeight(e.nativeEvent.layout.height)
            : undefined
        }
      />
    ),
    [cardWidth, onProductPress],
  );

  // Hide the section only when there are no substitutes at all.
  if (!isLoading && products.length === 0) return null;

  return (
    <View className="py-6" style={{ position: "relative" }}>
      <LinearGradient
        colors={["#F2FAF7", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View className="flex-row justify-between items-center mb-4 px-4">
        <View>
          <Text style={s.sectionTitle} className="text-brand-text ">
            Spend Less on What You Need
          </Text>
          <View className="mt-1">
            <Text style={s.sectionSubtitle}>More Affordable. Choices</Text>
            <LinearGradient
              colors={["#12975E", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: exactScale(3),
                width: exactScale(160),
                marginTop: exactScale(6),
                borderRadius: exactScale(2),
                opacity: 0.6,
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: exactScale(6),
          }}
        >
          <Image
            source={HOME_IMAGES.supplements}
            style={s.headerImage}
            contentFit="contain"
          />
          <Image
            source={HOME_IMAGES.multivitamin}
            style={s.headerImage}
            contentFit="contain"
          />
        </View>
      </View>

      {isLoading ? (
        <HomeProductCardSkeleton count={4} />
      ) : (
        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          nestedScrollEnabled
          directionalLockEnabled
          contentContainerStyle={{
            paddingLeft: exactScale(20),
            paddingRight: exactScale(40),
          }}
          ItemSeparatorComponent={ProductSeparator}
          // Sits after the last product so scrolling to the end leads
          // into the full catalogue.
          // View All only earns its card once the row is deep (10+ products).
          ListFooterComponent={
            onViewAll && products.length >= 10 ? (
              <View style={{ marginLeft: ROW_GAP }}>
                <ViewAllCard
                  width={cardWidth}
                  height={rowHeight}
                  accentColor={ACCENT}
                  onPress={onViewAll}
                  totalCount={totalCount}
                />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};
