import type { ImageSource } from "expo-image";
import React, { useCallback } from "react";
import { ActivityIndicator, View, Text, Animated } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/features/product/hooks/useProduct";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./SearchProductCard.styles";

interface SearchRowProps {
  data: {
    id: string;
    productId?: string;
    slug?: string;
    requiresPrescription?: boolean;
    recId?: string;
    recProductId?: string;
    recSlug?: string;
    searched: {
      name: string;
      brandName: string;
      description?: string;
      price: number | null;
      status: string;
    };
    recommended: {
      name: string;
      manufacturer: string;
      price: number | null;
      originalPrice: number | null;
      savings: number;
      description?: string;
      image?: ImageSource | null;
      packSize?: string;
      unit?: string;
    };
  };
  onBeforeNavigate?: () => void;
}

export const SearchProductCard = React.memo(({ data, onBeforeNavigate }: SearchRowProps) => {
  const router = useNav();

  const handleCardPress = useCallback(() => {
    onBeforeNavigate?.();
    const previewImage =
      typeof data.recommended.image === "string"
        ? data.recommended.image
        : data.recommended.image?.uri;
    router.push({
      pathname: "/search/product/[id]",
      params: {
        id: data.productId ?? data.id,
        previewName: data.recommended.name,
        previewImage: previewImage || undefined,
        previewBrand: data.recommended.manufacturer || undefined,
      },
    });
  }, [data, router, onBeforeNavigate]);

  const prefetchProduct = usePrefetchProduct();
  const handlePrefetch = useCallback(() => {
    const productId = data.productId ?? data.id;
    if (productId) prefetchProduct(productId);
  }, [prefetchProduct, data.productId, data.id]);

  const { count, increment, decrement, animations, isPending } = useCartActions(
    {
      medicineId: data.recId || data.id,
      variantId: null,
      productId: data.recProductId || data.productId,
      name: data.recommended.name,
      slug: data.recSlug || data.slug,
      price: data.recommended.price ?? 0,
      originalPrice: data.recommended.originalPrice ?? undefined,
      image: data.recommended.image,
      requiresPrescription: data.requiresPrescription,
      packSize: data.recommended.packSize,
      unit: data.recommended.unit,
    },
  );

  const { slideAnim, opacityAnim } = animations;
  const handleIncrement = increment;
  const handleDecrement = decrement;

  return (
    <Touchable
      testID="search-result-item"
      activeOpacity={0.5}
      onPress={handleCardPress}
      onPressIn={handlePrefetch}
      style={s.cardRoot}
    >
      {/* Top Section: Split Comparison */}
      <View style={s.splitRow}>
        {/* Left Side (White Background) */}
        <View style={s.leftSide}>
          <View style={s.titleCol}>
            <Text style={s.name} numberOfLines={2}>
              {data.searched.name}
            </Text>
            {data.searched.description ? (
              <Text style={s.desc} numberOfLines={1}>
                {data.searched.description}
              </Text>
            ) : null}
            {data.searched.brandName ? (
              <Text style={s.desc} numberOfLines={1}>
                {data.searched.brandName}
              </Text>
            ) : null}
          </View>
          <View style={s.priceCol}>
            {data.searched.price != null && (
              <Text style={s.searchedPrice}>
                ₹{Number(data.searched.price).toFixed(2)}
              </Text>
            )}
            <Text style={s.searchedStatus}>{data.searched.status}</Text>
          </View>
        </View>

        {/* Right Side (Pale Yellow Background) */}
        <View style={s.rightSide}>
          <View style={s.titleCol}>
            <Text style={s.name} numberOfLines={2}>
              {data.recommended.name}
            </Text>
            {data.recommended.description ? (
              <Text style={s.desc} numberOfLines={1}>
                {data.recommended.description}
              </Text>
            ) : null}
            {data.recommended.manufacturer ? (
              <Text style={s.descManufacturer} numberOfLines={1}>
                {data.recommended.manufacturer}
              </Text>
            ) : null}
          </View>
          <View style={s.priceCol}>
            <View style={s.recPriceRow}>
              {data.recommended.price != null && (
                <Text style={s.recPrice}>
                  ₹{Number(data.recommended.price).toFixed(2)}
                </Text>
              )}
              {data.recommended.originalPrice != null &&
                data.recommended.price != null &&
                data.recommended.originalPrice > data.recommended.price && (
                  <Text style={s.recMrp} numberOfLines={1}>
                    ₹{Number(data.recommended.originalPrice).toFixed(2)}
                  </Text>
                )}
            </View>
            {data.recommended.savings > 0 && (
              <View style={s.savingsRow}>
                <icons.sell
                  width={exactScale(15)}
                  height={exactScale(15)}
                  fill="#0F7635"
                  style={s.sellIcon}
                />
                <Text style={s.savingsText}>
                  Save ₹{Number(data.recommended.savings).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Horizontal Divider Line */}
      <View style={s.dividerLine} />

      {/* Bottom Section: Uniform Actions Row */}
      <View style={s.bottomSection}>
        <View style={s.sameCompRow}>
          <icons.check_circle width={exactScale(18)} height={exactScale(18)} fill="#0F7635" />
          <Text style={s.sameCompText}>SAME COMPOSITION</Text>
        </View>

        {count === 0 ? (
          <Touchable
            onPress={handleIncrement}
            disabled={isPending}
            activeOpacity={0.85}
            style={s.addBtn}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <Text style={s.addText}>ADD</Text>
            )}
          </Touchable>
        ) : (
          <View style={s.wrapActive}>
            <Touchable
              onPress={handleDecrement}
              disabled={isPending}
              activeOpacity={0.7}
              style={s.btn}
            >
              <Text style={s.plusMinus}>−</Text>
            </Touchable>
            <View style={s.countContainer}>
              {isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Animated.Text
                  style={[
                    s.countText,
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
              onPress={handleIncrement}
              disabled={isPending}
              activeOpacity={0.7}
              style={s.btn}
            >
              <Text style={s.plusMinus}>+</Text>
            </Touchable>
          </View>
        )}
      </View>
    </Touchable>
  );
});

SearchProductCard.displayName = "SearchProductCard";
