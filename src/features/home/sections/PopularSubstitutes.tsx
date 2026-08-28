import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/features/product/hooks/useProduct";
import type { Product } from "@/src/features/product/types";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  ScrollView,
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
  onProductPress?: (
    id: string,
    name?: string,
    image?: string,
    brand?: string,
  ) => void;
  onViewAll?: () => void;
  /** Catalogue size from the backend; the subtitle is hidden without it. */
  totalCount?: number;
}

const ACCENT = "#0F7635";
const ROW_GAP = exactScale(14);

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
    onProductPress?: (
      id: string,
      name?: string,
      image?: string,
      brand?: string,
    ) => void;
    onLayout?: (event: LayoutChangeEvent) => void;
  }) => {
    const imageAreaHeight = cardWidth * 0.875;
    const imageSize = imageAreaHeight * 0.65;

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
              price: product.price,
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
    const [imageError, setImageError] = useState(false);
    const hasImage = Boolean(
      (typeof product.image === "number" || product.image?.uri) && !imageError,
    );

    const prefetchProduct = usePrefetchProduct();
    const handlePrefetch = useCallback(() => {
      if (product.productId) prefetchProduct(product.productId);
    }, [prefetchProduct, product.productId]);

    const handleAdd = useCallback(async () => {
      const added = await increment();
      if (added) triggerFly();
    }, [increment, triggerFly]);

    return (
      <View
        style={[
          s.cardRoot,
          { width: cardWidth },
        ]}
        onLayout={onLayout}
      >
        {/* Image area — fixed height, tied to card width */}
        <Touchable
          activeOpacity={0.85}
          onPress={() => {
            if (!product.productId) return;
            const previewImage =
              typeof product.image === "string"
                ? product.image
                : (product.image as { uri?: string } | undefined)?.uri;
            onProductPress?.(
              product.productId,
              product.name,
              previewImage,
              product.brand,
            );
          }}
          onPressIn={handlePrefetch}
          style={[s.imageAreaTouchable, { height: imageAreaHeight }]}
        >
          <View style={s.imageAreaInner}>
            <View
              ref={imageRef}
              collapsable={false}
              style={[
                s.imageWrap,
                {
                  width: imageSize,
                  height: imageSize,
                },
              ]}
            >
              <icons.placeholder
                width={imageSize * 0.7}
                height={imageSize * 0.7}
              />
              {hasImage && (
                <Image
                  source={product.image}
                  style={s.productImage}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  recyclingKey={product.productId || product.id}
                  onError={() => setImageError(true)}
                />
              )}
            </View>
          </View>
          {!!product.discount && (
            <View style={s.badgeContainer}>
              <Text style={s.badge}>
                {product.discount}
              </Text>
            </View>
          )}
        </Touchable>

        {/* Details area */}
        <View style={s.detailsArea}>
          <Touchable
            activeOpacity={0.85}
            onPress={() => {
              if (!product.productId) return;
              onProductPress?.(product.productId);
            }}
            onPressIn={handlePrefetch}
          >
            <Text style={s.name} numberOfLines={1}>
              {product.name}
            </Text>
            {!!product.description && (
              <Text style={s.description} numberOfLines={1}>
                {product.description}
              </Text>
            )}
            <View style={s.priceRow}>
              <Text style={s.price}>₹{Number(product.price).toFixed(2)}</Text>
              {!!product.originalPrice &&
                product.originalPrice > product.price && (
                  <Text style={s.mrp}>
                    ₹{Number(product.originalPrice).toFixed(2)}
                  </Text>
                )}
            </View>
          </Touchable>

          {/* Button */}
          <View style={s.buttonWrap}>
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
                  style={s.counterBtn}
                >
                  <Text style={s.counter}>
                    −
                  </Text>
                </Touchable>
                <View style={s.counterNumberBox}>
                  {isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Animated.Text
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
                  onPress={increment}
                  disabled={isPending}
                  activeOpacity={0.7}
                  style={s.counterBtn}
                >
                  <Text style={s.counter}>
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
  const cardWidth = (width - exactScale(20) - exactScale(14) - exactScale(36)) / 2;
  const [rowHeight, setRowHeight] = useState(0);

  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <ProductCard
        product={item}
        cardWidth={cardWidth}
        onProductPress={onProductPress}
        onLayout={
          index === 0
            ? (e) => setRowHeight(e.nativeEvent.layout.height)
            : undefined
        }
      />
    ),
    [cardWidth, onProductPress],
  );

  if (!isLoading && products.length === 0) return null;

  return (
    <View style={s.root}>
      <LinearGradient
        colors={["#F2FAF7", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.headerRow}>
        <View>
          <Text style={s.sectionTitle}>
            Spend Less on What You Need
          </Text>
          <View style={{ marginTop: exactScale(4) }}>
            <Text style={s.sectionSubtitle}>More Affordable. Choices</Text>
            <LinearGradient
              colors={["#12975E", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.subtitleUnderline}
            />
          </View>
        </View>
        <View style={s.headerImagesRow}>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          directionalLockEnabled
          contentContainerStyle={s.scrollContent}
        >
          {products.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <ProductSeparator />}
              {renderProduct({ item, index })}
            </React.Fragment>
          ))}
          {onViewAll && products.length >= 10 && (
            <View style={{ marginLeft: ROW_GAP }}>
              <ViewAllCard
                width={cardWidth}
                height={rowHeight}
                accentColor={ACCENT}
                onPress={onViewAll}
                totalCount={totalCount}
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};
