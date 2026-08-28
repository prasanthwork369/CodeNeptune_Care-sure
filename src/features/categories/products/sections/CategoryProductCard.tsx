import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import { icons } from "@/src/constants/icons";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/features/product/hooks/useProduct";
import { CategoryProductCardProps } from "@/src/features/categories/types";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { styles as s } from "./CategoryProductCard.styles";

const CategoryProductCardBase: React.FC<CategoryProductCardProps> = ({
  product,
  cardWidth,
  onPress,
}) => {
  const { imageRef, triggerFly } = useFlyToCartTrigger(
    product.image,
    product.id,
  );

  const { count, increment, decrement, animations, isPending } = useCartActions(
    {
      medicineId: product.id,
      variantId: null,
      productId: product.productId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      discountPercent: product.discountPercent,
      image: product.image,
      packSize: product.packSize,
      unit: product.unit,
    },
  );

  const { slideAnim, opacityAnim } = animations;

  const handlePress = () => onPress(product);

  const prefetchProduct = usePrefetchProduct();
  const handlePrefetch = useCallback(() => {
    if (product.productId) prefetchProduct(product.productId);
  }, [prefetchProduct, product.productId]);

  const handleAdd = async () => {
    const added = await increment();
    if (added && Number(product.price) > 0) triggerFly();
  };

  return (
    <View style={[s.cardRoot, { width: cardWidth }]}>
      <View style={{ position: "relative" }}>
        {/* Image container */}
        <Touchable
          activeOpacity={0.7}
          onPress={handlePress}
          onPressIn={handlePrefetch}
          style={[
            s.imageTouchable,
            { height: cardWidth * 1.05 },
          ]}
        >
          <View
            ref={imageRef}
            style={s.imageInner}
            collapsable={false}
          >
            {product.image ? (
              <Image
                source={product.image}
                style={s.productImage}
                contentFit="contain"
                cachePolicy="memory-disk"
                recyclingKey={product.id}
              />
            ) : (
              <icons.placeholder width="78%" height="68%" />
            )}
          </View>
        </Touchable>

        {/* Add / Counter — bottom right corner */}
        <View style={s.btnCornerWrap}>
          {count === 0 ? (
            <Touchable
              activeOpacity={0.8}
              onPress={handleAdd}
              disabled={isPending}
              style={s.addBtn}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#0F7635" />
              ) : (
                <Text style={s.addText}>ADD</Text>
              )}
            </Touchable>
          ) : (
            <View style={s.activeBtnRow}>
              <Touchable
                onPress={decrement}
                disabled={isPending}
                style={s.counterBtn}
              >
                <Text style={s.plusMinus}>−</Text>
              </Touchable>

              <View style={s.countValWrap}>
                {isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Animated.Text
                    style={[
                      s.countVal,
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
                style={s.counterBtn}
              >
                <Text style={s.plus}>+</Text>
              </Touchable>
            </View>
          )}
        </View>
      </View>

      {/* Info below card */}
      <View style={s.infoContainer}>
        <View style={s.pricingRow}>
          <View style={s.priceBadge}>
            <Text style={s.price}>₹{Number(product.price).toFixed(2)}</Text>
          </View>
          {!!product.originalPrice && product.originalPrice > product.price && (
            <Text style={s.mrp}>
              ₹{Number(product.originalPrice).toFixed(2)}
            </Text>
          )}
          {!!product.discount && (
            <LinearGradient
              colors={["#C4F15619", "#50B53B19"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.1 }}
              style={s.discountGrad}
            >
              <View style={s.discountInner}>
                <Text style={s.discount}>{product.discount}</Text>
              </View>
              <OfferShine borderRadius={exactScale(4)} />
            </LinearGradient>
          )}
        </View>

        <Text
          style={s.name}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <Text
          style={s.desc}
          numberOfLines={1}
        >
          {product.description}
        </Text>
      </View>
    </View>
  );
};

// Memoized so a grid re-render (cart tick, refresh) only re-renders changed cards.
export const CategoryProductCard = React.memo(CategoryProductCardBase);
