import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import { icons } from "@/src/constants/icons";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/features/product/hooks/useProduct";
import type { Product } from "@/src/features/product/types";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { styles as s } from "./HomeProductCard.styles";

interface Props {
  item: Product;
  cardWidth: number;
  cardHeight: number;
  imageSize: number;
  badgeBgColor: string;
  badgeTextColor: string;
  detailsBgColor: string;
  buttonColor?: string;
  onPress?: (id: string) => void;
  disableCart?: boolean;
}

export const HomeProductCard: React.FC<Props> = React.memo(
  ({
    item,
    cardWidth,
    cardHeight,
    imageSize,
    badgeBgColor,
    badgeTextColor,
    detailsBgColor,
    buttonColor = "#0F7635",
    onPress,
    disableCart = false,
  }) => {
    const prefetchProduct = usePrefetchProduct();

    const handlePrefetch = useCallback(() => {
      const targetId = item.productId || item.id;
      if (targetId) prefetchProduct(targetId);
    }, [prefetchProduct, item.productId, item.id]);

    const handleCardPress = useCallback(() => {
      if (!onPress) return;
      onPress(item.id);
    }, [onPress, item.id]);

    const { count, increment, decrement, isPending, animations } =
      useCartActions({
        medicineId: item.id,
        variantId: item.defaultVariant?.id ?? null,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        price: item.defaultVariant?.sellingPrice ?? item.price,
        originalPrice: item.defaultVariant?.mrp ?? item.originalPrice,
        discountPercent:
          item.defaultVariant?.discountPercent ?? item.discountPercent,
        image: item.image,
        requiresPrescription: item.requiresPrescription,
        packSize: item.defaultVariant?.packSize ?? item.packSize,
        unit: item.defaultVariant?.unit ?? item.unit,
      });

    const { slideAnim, opacityAnim } = animations;

    return (
      <View
        style={[
          s.cardRoot,
          {
            width: cardWidth,
            height: cardHeight,
          },
        ]}
      >
        {/* Tappable area → product detail */}
        <Touchable
          activeOpacity={0.85}
          onPress={handleCardPress}
          onPressIn={handlePrefetch}
          style={s.touchableMain}
        >
          {/* Image */}
          <View
            style={[
              s.imageWrap,
              { height: imageSize * 1.5 },
            ]}
          >
            {!!item.discount && (
              <View
                style={[
                  s.badgeWrap,
                  { backgroundColor: badgeBgColor },
                ]}
              >
                <Text
                  style={[s.badgeText, { color: badgeTextColor }]}
                >
                  {item.discount}
                </Text>
                <OfferShine borderRadius={exactScale(4)} />
              </View>
            )}
            {item.image ? (
              <Image
                source={item.image}
                style={{ width: imageSize, height: imageSize }}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            ) : (
              <icons.placeholder
                width={imageSize * 0.55}
                height={imageSize * 0.55}
              />
            )}
          </View>

          {/* Product info */}
          <View
            style={[
              s.infoArea,
              { backgroundColor: detailsBgColor },
            ]}
          >
            <Text
              numberOfLines={2}
              style={s.name}
            >
              {item.name}
            </Text>
            <Text
              style={s.description}
            >
              {item.description}
            </Text>
            <View style={s.priceRow}>
              <Text style={s.price}>
                ₹{Number(item.price).toFixed(2)}
              </Text>
              {!!item.originalPrice && item.originalPrice > item.price && (
                <View style={s.mrpWrap}>
                  <Text style={s.mrpLabel}>
                    MRP
                  </Text>
                  <Text style={s.mrpValue}>
                    ₹{Number(item.originalPrice).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Touchable>

        {/* Cart button */}
        <View style={[s.buttonContainer, { backgroundColor: detailsBgColor }]}>
          {count === 0 ? (
            <Touchable
              activeOpacity={0.85}
              onPress={disableCart ? undefined : increment}
              disabled={isPending || disableCart}
              style={[
                s.addBtnTouchable,
                { borderColor: buttonColor },
              ]}
            >
              <Text
                style={[s.addToCart, { color: buttonColor }]}
              >
                {isPending ? "Adding..." : "Add to Cart"}
              </Text>
            </Touchable>
          ) : (
            <View
              style={[
                s.cartBtnActive,
                { backgroundColor: buttonColor },
              ]}
            >
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
              <View style={s.counterValWrap}>
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
    );
  },
);
HomeProductCard.displayName = "HomeProductCard";
