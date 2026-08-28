import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { icons } from "@/src/constants/icons";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/features/product/hooks/useProduct";
import type { SubstituteProduct } from "@/src/features/product/types";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { styles as s } from "./FrequentSubstitutes.styles";
import { exactScale } from "@/src/utils/exactScale";

interface FrequentSubstitutesProps {
  substitutes: SubstituteProduct[];
  title?: string;
  isLoading?: boolean;
  onProductPress?: (
    id: string,
    name?: string,
    image?: string,
    brand?: string,
  ) => void;
  onViewAll?: () => void;
  disableCart?: boolean;
}

const HOME_PREVIEW_LIMIT = 4;

const FrequentItem = React.memo(
  ({
    item,
    onProductPress,
    disableCart,
  }: {
    item: SubstituteProduct;
    onProductPress?: (
      id: string,
      name?: string,
      image?: string,
      brand?: string,
    ) => void;
    disableCart?: boolean;
  }) => {
    const { count, increment, decrement, isPending, animations } =
      useCartActions({
        medicineId: item.id,
        variantId: null,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        price: item.price,
        originalPrice: item.originalPrice,
        discountPercent: item.discountPercent,
        image: item.image,
        requiresPrescription: item.requiresPrescription,
        packSize: item.packSize,
        unit: item.unit,
      });

    const { slideAnim, opacityAnim } = animations;

    const { imageRef, triggerFly } = useFlyToCartTrigger(item.image, item.id);
    const [imageError, setImageError] = useState(false);
    const hasImage = Boolean(
      (typeof item.image === "number" || item.image?.uri) && !imageError,
    );

    const prefetchProduct = usePrefetchProduct();
    const handlePrefetch = useCallback(() => {
      if (item.productId) prefetchProduct(item.productId);
    }, [prefetchProduct, item.productId]);

    const handleAdd = useCallback(async () => {
      if (disableCart) return;
      const added = await increment();
      if (added) triggerFly();
    }, [disableCart, increment, triggerFly]);

    return (
      <View style={s.itemRoot}>
        {/* Tappable area → product detail */}
        <Touchable
          activeOpacity={0.85}
          onPress={() => {
            if (!item.productId) return;
            const previewImage =
              typeof item.image === "string"
                ? item.image
                : (item.image as { uri?: string } | undefined)?.uri;
            onProductPress?.(
              item.productId,
              item.name,
              previewImage,
              item.brand,
            );
          }}
          onPressIn={handlePrefetch}
          style={s.itemMainTouchable}
        >
          <View style={s.imgBox}>
            <View
              ref={imageRef}
              collapsable={false}
              style={s.imgContainer}
            >
              <icons.placeholder
                width={exactScale(44)}
                height={exactScale(44)}
              />
              {hasImage && (
                <Image
                  source={item.image}
                  style={s.imgInner}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  recyclingKey={item.productId || item.id}
                  onError={() => setImageError(true)}
                />
              )}
            </View>
            {!!item.discount && (
              <View style={s.badgeWrap}>
                <Text style={s.badge}>
                  {item.discount}
                </Text>
                <OfferShine borderRadius={exactScale(4)} />
              </View>
            )}
          </View>
          <View style={s.infoCol}>
            <Text
              style={s.name}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {!!item.brand && (
              <Text
                style={s.brand}
                numberOfLines={1}
              >
                {item.brand}
              </Text>
            )}
            {!!item.description && (
              <Text
                style={s.description}
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
            <View style={s.priceRow}>
              <Text style={s.price}>
                ₹{(Number(item.price) || 0).toFixed(2)}
              </Text>
              {!!item.originalPrice &&
                Number(item.originalPrice) > Number(item.price) && (
                  <Text style={s.mrp}>
                    ₹{(Number(item.originalPrice) || 0).toFixed(2)}
                  </Text>
                )}
            </View>
          </View>
        </Touchable>

        {/* Cart button */}
        {count === 0 ? (
          <Touchable
            onPress={disableCart ? undefined : handleAdd}
            disabled={isPending || disableCart}
            activeOpacity={0.85}
            style={s.addBtnWrap}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <Text style={s.addBtn}>
                ADD
              </Text>
            )}
          </Touchable>
        ) : (
          <View style={s.cartBtnActive}>
            <Touchable
              onPress={disableCart ? undefined : decrement}
              disabled={isPending || disableCart}
              activeOpacity={0.7}
              style={s.counterBtn}
            >
              <Text style={s.counter}>
                −
              </Text>
            </Touchable>
            <View style={s.counterValueWrap}>
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
              onPress={disableCart ? undefined : increment}
              disabled={isPending || disableCart}
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
    );
  },
);
FrequentItem.displayName = "FrequentItem";

export const FrequentSubstitutes: React.FC<FrequentSubstitutesProps> =
  React.memo(
    ({
      substitutes = [],
      title = "Frequently Ordered Products",
      onProductPress,
      onViewAll,
      disableCart,
    }) => {
      const visibleSubstitutes = useMemo(
        () => (substitutes ?? []).slice(0, HOME_PREVIEW_LIMIT),
        [substitutes],
      );

      if (!visibleSubstitutes.length) return null;

      return (
        <View style={s.root}>
          <View style={s.headerRow}>
            <Text style={s.titleText}>
              {title}
            </Text>
            {!!onViewAll && (
              <Touchable onPress={onViewAll} accessibilityRole="button">
                <Text style={s.viewAllText}>
                  View All
                </Text>
              </Touchable>
            )}
          </View>
          <View style={s.listGap}>
            {visibleSubstitutes.map((item, index) => (
              <FrequentItem
                key={`${item?.productId ?? item?.id ?? index}-${index}`}
                item={item}
                onProductPress={onProductPress}
                disableCart={disableCart}
              />
            ))}
          </View>
        </View>
      );
    },
  );
FrequentSubstitutes.displayName = "FrequentSubstitutes";
