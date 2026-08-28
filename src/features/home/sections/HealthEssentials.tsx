import type {
  ApiFeaturedSubcategory,
  ApiFeaturedSubcategoryMetadata,
} from "@/src/features/categories/types";
import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { icons } from "@/src/constants/icons";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/features/product/hooks/useProduct";
import { usePrefetchCategoryProducts } from "@/src/features/categories/hooks/useCategories";
import { formatPackLabel } from "@/src/utils/packLabel";
import { resolveAssetUrl } from "@/src/utils/urls";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import React, { useCallback, useMemo, useState } from "react";
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
import { styles as s } from "./HealthEssentials.styles";
import { exactScale } from "@/src/utils/exactScale";

const ROW_GAP = exactScale(14);

const ProductSeparator = () => <View style={{ width: ROW_GAP }} />;

const FALLBACK_THEMES = [
  {
    gradientStart: "#F2FAF7",
    gradientEnd: "#FFFFFF",
    text2Color: "#12975E",
    lineColor: "#12975E",
  },
  {
    gradientStart: "#FFF2FC",
    gradientEnd: "#FFFFFF",
    text2Color: "#DE399B",
    lineColor: "#DD3599",
  },
  {
    gradientStart: "#EFF9FF",
    gradientEnd: "#FFFFFF",
    text2Color: "#2DAAFF",
    lineColor: "#46B3FB",
  },
  {
    gradientStart: "#F3EAFF",
    gradientEnd: "#FFFFFF",
    text2Color: "#6957EB",
    lineColor: "#6957EB",
  },
];

interface ProductCardProps {
  id: string;
  productId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number;
  discountPercentage: number;
  thumbnailUrl: string;
  accentColor: string;
  cardWidth: number;
  onPress: (id: string, name?: string, image?: string, brand?: string) => void;
  packSize?: string;
  unit?: string;
  brand?: string;
  onLayout?: (e: LayoutChangeEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({
    id,
    productId,
    name,
    slug,
    description,
    price,
    mrp,
    discountPercentage,
    thumbnailUrl,
    accentColor,
    cardWidth,
    onPress,
    packSize,
    unit,
    brand,
    onLayout,
  }) => {
    const imageAreaHeight = cardWidth * 0.875;
    const imageSize = imageAreaHeight * 0.65;

    const imageSource = useMemo(
      () => (thumbnailUrl ? { uri: resolveAssetUrl(thumbnailUrl) } : undefined),
      [thumbnailUrl],
    );

    const [imageError, setImageError] = useState(false);
    const hasImage = Boolean(
      (typeof imageSource === "number" || imageSource?.uri) && !imageError,
    );

    const { count, increment, decrement, animations, isPending } =
      useCartActions({
        medicineId: id,
        variantId: null,
        productId,
        name,
        slug,
        price,
        originalPrice: mrp,
        discountPercent: discountPercentage,
        image: imageSource,
        packSize,
        unit,
      });
    const { slideAnim, opacityAnim } = animations;

    const { imageRef, triggerFly } = useFlyToCartTrigger(imageSource, id);

    const prefetchProduct = usePrefetchProduct();
    const handlePrefetch = useCallback(() => {
      if (productId) prefetchProduct(productId);
    }, [prefetchProduct, productId]);

    const handleAdd = useCallback(async () => {
      const added = await increment();
      if (added) triggerFly();
    }, [increment, triggerFly]);

    const discountLabel =
      discountPercentage > 0 ? `${Math.round(discountPercentage)}% OFF` : "";
    const discountBg = `${accentColor}1A`;
    const contentBg = `${accentColor}0D`;

    return (
      <View
        style={[
          s.cardRoot,
          { width: cardWidth },
        ]}
        onLayout={onLayout}
      >
        {/* Image area */}
        <Touchable
          activeOpacity={0.85}
          onPress={() => {
            const previewImage = thumbnailUrl
              ? resolveAssetUrl(thumbnailUrl)
              : undefined;
            onPress(productId, name, previewImage, brand);
          }}
          onPressIn={handlePrefetch}
          style={[
            s.imageAreaTouchable,
            {
              height: imageAreaHeight,
              backgroundColor: contentBg,
            },
          ]}
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
                  source={imageSource}
                  style={s.productImage}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  recyclingKey={productId || id}
                  onError={() => setImageError(true)}
                />
              )}
            </View>
          </View>
          {!!discountLabel && (
            <View
              style={[
                s.badgeContainer,
                { backgroundColor: discountBg },
              ]}
            >
              <Text
                style={[s.badge, { color: accentColor }]}
              >
                {discountLabel}
              </Text>
              <OfferShine borderRadius={exactScale(4)} />
            </View>
          )}
        </Touchable>

        {/* Details area */}
        <View
          style={[
            s.detailsArea,
            { backgroundColor: contentBg },
          ]}
        >
          <Touchable
            activeOpacity={0.85}
            onPress={() => onPress(productId)}
            onPressIn={handlePrefetch}
          >
            <Text
              style={s.name}
              numberOfLines={1}
            >
              {name}
            </Text>
            {!!description && (
              <Text style={s.description} numberOfLines={1}>
                {description}
              </Text>
            )}
            <View style={s.priceRow}>
              <Text style={s.price}>₹{Number(price).toFixed(2)}</Text>
              {mrp > price && (
                <Text style={s.mrp}>₹{Number(mrp).toFixed(2)}</Text>
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
                style={[s.cartBtn, { borderColor: accentColor }]}
              >
                <Text style={[s.addBtn, { color: accentColor }]}>
                  {isPending ? "Adding..." : "Add to Cart"}
                </Text>
              </Touchable>
            ) : (
              <View style={[s.cartBtnActive, { backgroundColor: accentColor }]}>
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
ProductCard.displayName = "HealthEssentialsProductCard";

interface HealthEssentialsSectionProps {
  subcategory: ApiFeaturedSubcategory;
  themeIndex: number;
  onProductPress: (
    productId: string,
    name?: string,
    image?: string,
    brand?: string,
  ) => void;
  onViewAll?: (subcategory: ApiFeaturedSubcategory) => void;
}

export const HealthEssentialsSection: React.FC<HealthEssentialsSectionProps> =
  React.memo(({ subcategory, themeIndex, onProductPress, onViewAll }) => {
    const prefetchCategory = usePrefetchCategoryProducts();
    const { width } = useWindowDimensions();

    const meta: ApiFeaturedSubcategoryMetadata | null =
      subcategory.featuredMetadata;
    const fallback = FALLBACK_THEMES[themeIndex % FALLBACK_THEMES.length];
    const cardWidth = (width - exactScale(20) - exactScale(14) - exactScale(36)) / 2;
    const [rowHeight, setRowHeight] = useState(0);

    const gradientStart = meta?.bgGradientStart?.trim() || "#FFFFFF";
    const gradientEnd = meta?.bgGradientEnd?.trim() || fallback.gradientEnd;
    const text2Color = meta?.text2Color || fallback.text2Color;
    const lineColor = meta?.lineColor || fallback.lineColor;
    const title = meta?.text1 || subcategory.categoryName;
    const subtitle = meta?.text2 || subcategory.name;
    const headerImage = meta?.featuredImageUrl || subcategory.imageUrl;

    const renderProduct = useCallback(
      ({
        item: p,
        index,
      }: {
        item: ApiFeaturedSubcategory["products"][number];
        index: number;
      }) => {
        const packLabel = formatPackLabel({
          packSize: p.packSize,
          unit: p.unit,
          dosageForm: p.dosageForm,
        });
        const displayDesc = packLabel || p.description || "";

        return (
          <ProductCard
            id={p.id}
            productId={p.productId}
            name={p.name}
            slug={p.slug}
            description={displayDesc}
            accentColor={lineColor}
            price={Number(p.price)}
            mrp={Number(p.mrp ?? p.price)}
            discountPercentage={Number(p.discountPercentage)}
            thumbnailUrl={p.thumbnailUrl}
            cardWidth={cardWidth}
            onPress={onProductPress}
            packSize={String(p.packSize ?? "")}
            unit={p.unit}
            brand={p.brandName}
            onLayout={
              index === 0
                ? (e) => setRowHeight(e.nativeEvent.layout.height)
                : undefined
            }
          />
        );
      },
      [cardWidth, lineColor, onProductPress],
    );

    return (
      <View>
        <View style={{ position: "relative" }}>
          <LinearGradient
            colors={[gradientStart || "#FFFFFF", gradientEnd || "#FFFFFF"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={s.sectionWrap}>
            <View style={s.sectionHeaderRow}>
              <View style={s.sectionTitleCol}>
                <Text style={s.sectionTitle}>
                  {title}
                </Text>
                <View style={{ marginTop: exactScale(4) }}>
                  <Text style={[s.sectionSubtitle, { color: text2Color }]}>
                    {subtitle}
                  </Text>
                  <LinearGradient
                    colors={[lineColor, "rgba(255,255,255,0)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.subtitleUnderline}
                  />
                </View>
              </View>
              {!!headerImage && (
                <Image
                  source={{ uri: resolveAssetUrl(headerImage) }}
                  style={s.headerImage}
                  contentFit="contain"
                />
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              directionalLockEnabled
              contentContainerStyle={s.scrollContent}
            >
              {subcategory.products.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <ProductSeparator />}
                  {renderProduct({ item, index })}
                </React.Fragment>
              ))}
              {onViewAll && subcategory.products.length > 0 && (
                <View style={{ marginLeft: ROW_GAP }}>
                  <ViewAllCard
                    width={cardWidth}
                    height={rowHeight}
                    accentColor={lineColor}
                    onPress={() => onViewAll(subcategory)}
                    onPressIn={() => {
                      if (subcategory.slug) {
                        prefetchCategory({
                          categorySlug:
                            subcategory.familySlug || subcategory.slug,
                          subCategorySlug: subcategory.familySlug
                            ? subcategory.slug
                            : undefined,
                        });
                      }
                    }}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  });
HealthEssentialsSection.displayName = "HealthEssentialsSection";

interface HealthEssentialsProps {
  subcategories: ApiFeaturedSubcategory[];
  isLoading?: boolean;
  onProductPress: (productId: string) => void;
  onViewAll?: (subcategory: ApiFeaturedSubcategory) => void;
}

export const HealthEssentials: React.FC<HealthEssentialsProps> = React.memo(
  ({ subcategories, isLoading, onProductPress, onViewAll }) => {
    if (isLoading) {
      return <HomeProductCardSkeleton count={3} />;
    }

    if (subcategories.length === 0) return null;

    return (
      <View style={{ gap: exactScale(10) }}>
        {subcategories.map((sub, index) => (
          <HealthEssentialsSection
            key={sub.id}
            subcategory={sub}
            themeIndex={index}
            onProductPress={onProductPress}
            onViewAll={onViewAll}
          />
        ))}
      </View>
    );
  },
);
HealthEssentials.displayName = "HealthEssentials";
