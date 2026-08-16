import {
  ApiFeaturedSubcategory,
  ApiFeaturedSubcategoryMetadata,
} from "@/src/api/category.api";
import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/hooks/queries/useProduct";
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

// Hoisted: an inline arrow is a new component type every render, which remounts
// every separator in the row instead of reusing them.
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
  onPress: (productId: string) => void;
  packSize?: string;
  unit?: string;
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
    onLayout,
  }) => {
    // Image area height is tied to card width; the details area below it
    // sizes itself to its own content instead of a forced half-split (see
    // PopularSubstitutes.tsx for the same fix and why).
    const imageAreaHeight = cardWidth * 0.875;
    const imageSize = imageAreaHeight * 0.65;

    // One source object for the card, the cart row and the fly animation.
    const imageSource = useMemo(
      () => (thumbnailUrl ? { uri: resolveAssetUrl(thumbnailUrl) } : undefined),
      [thumbnailUrl],
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
      // Only animate on a confirmed add: offline the increment refuses and a
      // fly-in would falsely show the item landing in the cart.
      const added = await increment();
      if (added) triggerFly();
    }, [increment, triggerFly]);

    const discountLabel =
      discountPercentage > 0 ? `${Math.round(discountPercentage)}% OFF` : "";
    const discountBg = `${accentColor}1A`;
    const contentBg = `${accentColor}0D`;

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
          onPress={() => onPress(productId)}
          onPressIn={handlePrefetch}
          style={{
            height: imageAreaHeight,
            backgroundColor: contentBg,
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
                source={imageSource}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </View>
          </View>
          {!!discountLabel && (
            <View
              style={[
                s.badgeContainer,
                { backgroundColor: discountBg, zIndex: 10, overflow: "hidden" },
              ]}
            >
              <Text
                style={[s.badge, { color: accentColor, fontWeight: "800" }]}
              >
                {discountLabel}
              </Text>
              <OfferShine borderRadius={exactScale(4)} />
            </View>
          )}
        </Touchable>

        {/* Details area — sized to its own content, not a forced half-split */}
        <View
          style={{
            backgroundColor: contentBg,
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            paddingHorizontal: exactScale(12),
            paddingTop: exactScale(12),
            flexDirection: "column",
          }}
        >
          <Touchable
            activeOpacity={0.85}
            onPress={() => onPress(productId)}
            onPressIn={handlePrefetch}
          >
            <Text
              style={s.name}
              className="font-inter-medium text-brand-text"
              numberOfLines={1}
            >
              {name}
            </Text>
            {!!description && (
              <Text style={s.description} className="mt-0.5" numberOfLines={1}>
                {description}
              </Text>
            )}
            <View
              className="flex-row items-center gap-x-1.5 mt-1.5"
              style={{ marginBottom: exactScale(8) }}
            >
              <Text style={s.price}>₹{Number(price).toFixed(2)}</Text>
              {mrp > price && (
                <Text style={s.mrp}>₹{Number(mrp).toFixed(2)}</Text>
              )}
            </View>
          </Touchable>

          {/* Button — fixed padding, always at bottom */}
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
ProductCard.displayName = "HealthEssentialsProductCard";

interface HealthEssentialsSectionProps {
  subcategory: ApiFeaturedSubcategory;
  themeIndex: number;
  onProductPress: (productId: string) => void;
  onViewAll?: (subcategory: ApiFeaturedSubcategory) => void;
}

// Exported so the Home feed can render each subcategory as its own virtualized
// row (see HomeLayout) instead of mounting every row at once.
export const HealthEssentialsSection: React.FC<HealthEssentialsSectionProps> =
  React.memo(({ subcategory, themeIndex, onProductPress, onViewAll }) => {
    const { width } = useWindowDimensions();
    const meta: ApiFeaturedSubcategoryMetadata | null =
      subcategory.featuredMetadata;
    const fallback = FALLBACK_THEMES[themeIndex % FALLBACK_THEMES.length];
    const cardWidth = (width - 20 - 14 - 36) / 2;
    // Cards size to their own content, so measure a real one to match it.
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
            // Measure one real card; the View All card then matches it.
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

          <View className="pt-6 pb-8">
            <View className="px-4 flex-row justify-between items-center mb-4">
              <View className="flex-1 pr-2">
                <Text
                  style={s.sectionTitle}
                  className="font-inter-bold text-brand-text"
                >
                  {title}
                </Text>
                <View className="mt-1">
                  <Text
                    className="font-inter-extrabold"
                    style={[s.sectionSubtitle, { color: text2Color }]}
                  >
                    {subtitle}
                  </Text>
                  <LinearGradient
                    colors={[lineColor, "rgba(255,255,255,0)"]}
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
              {!!headerImage && (
                <Image
                  source={{ uri: resolveAssetUrl(headerImage) }}
                  style={{ width: "25%", height: exactScale(75) }}
                  contentFit="contain"
                />
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              directionalLockEnabled
              contentContainerStyle={{
                flexDirection: "row",
                paddingLeft: exactScale(20),
                paddingRight: exactScale(40),
              }}
            >
              {subcategory.products.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && <ProductSeparator />}
                  {renderProduct({ item, index })}
                </React.Fragment>
              ))}
              {/* Sits after the last product so scrolling to the end
                  leads into this subcategory. */}
              {onViewAll && subcategory.products.length > 0 && (
                <View style={{ marginLeft: ROW_GAP }}>
                  <ViewAllCard
                    width={cardWidth}
                    height={rowHeight}
                    // Same accent the row's product cards use.
                    accentColor={lineColor}
                    onPress={() => onViewAll(subcategory)}
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
