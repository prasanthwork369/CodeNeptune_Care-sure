import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { useCartActions } from "@/src/hooks/useCartActions";
import type { SubstituteProduct } from "@/src/types/home";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { styles as s } from "./FrequentSubstitutes.styles";
import { exactScale } from "@/src/utils/exactScale";

interface FrequentSubstitutesProps {
  substitutes: SubstituteProduct[];
  onProductPress?: (id: string) => void;
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
    onProductPress?: (id: string) => void;
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
        // Pass the discount so the cart charges the discounted price, not the
        // MRP — the backend derives selling = mrp * (1 - discountPercent/100),
        // matching the web ProductCard's add-to-cart.
        discountPercent: item.discountPercent,
        image: item.image,
        requiresPrescription: item.requiresPrescription,
        packSize: item.packSize,
        unit: item.unit,
      });

    const { slideAnim, opacityAnim } = animations;

    const { imageRef, triggerFly } = useFlyToCartTrigger(item.image, item.id);

    const handleAdd = useCallback(() => {
      if (disableCart) return;
      increment();
      triggerFly();
    }, [disableCart, increment, triggerFly]);

    return (
      <View className="flex-row items-center  pb-4">
        {/* Tappable area → product detail */}
        <Touchable
          activeOpacity={0.7}
          onPress={() => {
            // productId only: the medicine id cannot resolve on the product route.
            if (!item.productId) return;
            onProductPress?.(item.productId);
          }}
          className="flex-row items-center flex-1"
        >
          <View
            style={[
              s.imgBox,
              {
                backgroundColor: "#fff",
                borderRadius: exactScale(12),
                borderWidth: 1,
                borderColor: "#919EAB1A",
                marginRight: exactScale(12),
              },
            ]}
          >
            <View
              ref={imageRef}
              collapsable={false}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={item.image?.uri ? item.image : undefined}
                style={s.imgInner}
                contentFit="contain"
              />
            </View>
            {!!item.discount && (
              <View
                style={{
                  position: "absolute",
                  top: exactScale(6),
                  left: exactScale(6),
                  backgroundColor: "#E8F5E9",
                  paddingHorizontal: exactScale(5),
                  paddingVertical: exactScale(2),
                  borderRadius: exactScale(4),
                  zIndex: 10,
                  overflow: "hidden",
                }}
              >
                <Text
                  style={[s.badge, { fontWeight: "800", color: "#0F7635" }]}
                >
                  {item.discount}
                </Text>
                <OfferShine borderRadius={exactScale(4)} />
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text
              style={s.name}
              className="font-inter-semibold text-brand-text mb-0.5"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {!!item.brand && (
              <Text
                style={s.brand}
                className="font-inter-medium text-brand-subtext mb-1"
                numberOfLines={1}
              >
                {item.brand}
              </Text>
            )}
            {!!item.description && (
              <Text
                style={s.description}
                className="font-inter text-brand-subtext mb-2"
                numberOfLines={1}
              >
                {item.description}
              </Text>
            )}
            <View className="flex-row items-center gap-x-2">
              <Text className="text-base font-inter-bold text-brand-text">
                ₹{Number(item.price).toFixed(2)}
              </Text>
              {!!item.originalPrice && item.originalPrice > item.price && (
                <Text
                  style={s.mrp}
                  className="font-inter text-brand-subtext line-through"
                >
                  ₹{Number(item.originalPrice).toFixed(2)}
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
            className="rounded-[8px] bg-white ml-3"
            style={{
              borderWidth: 1,
              borderColor: "#0F7635",
              width: exactScale(72),
              height: exactScale(36),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <Text
                style={[s.addBtn, { color: "#0F7635" }]}
                className="font-inter-bold"
              >
                Add
              </Text>
            )}
          </Touchable>
        ) : (
          <View
            className="flex-row items-center rounded-[8px] overflow-hidden ml-3"
            style={{ backgroundColor: "#0F7635", minWidth: 72 }}
          >
            <Touchable
              onPress={disableCart ? undefined : decrement}
              disabled={isPending || disableCart}
              activeOpacity={0.7}
              style={{
                width: exactScale(32),
                paddingVertical: exactScale(8),
                alignItems: "center",
                justifyContent: "center",
              }}
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
                flex: 1,
                paddingVertical: exactScale(8),
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
              onPress={disableCart ? undefined : handleAdd}
              disabled={isPending || disableCart}
              activeOpacity={0.7}
              style={{
                width: exactScale(32),
                paddingVertical: exactScale(8),
                alignItems: "center",
                justifyContent: "center",
              }}
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
    );
  },
);
FrequentItem.displayName = "FrequentItem";

export const FrequentSubstitutes: React.FC<FrequentSubstitutesProps> =
  React.memo(({ substitutes, onProductPress, onViewAll, disableCart }) => {
    const visibleSubstitutes = useMemo(
      () => substitutes.slice(0, HOME_PREVIEW_LIMIT),
      [substitutes],
    );

    return (
      <View className="px-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-inter-bold text-brand-text">
            Frequently Ordered Products
          </Text>
          <Touchable onPress={onViewAll} accessibilityRole="button">
            <Text className="text-base font-inter-semibold text-brand-primary">
              View All
            </Text>
          </Touchable>
        </View>
        <View className="gap-y-4">
          {visibleSubstitutes.map((item, index) => (
            <FrequentItem
              key={`${item.productId ?? item.id}-${index}`}
              item={item}
              onProductPress={onProductPress}
              disableCart={disableCart}
            />
          ))}
        </View>
      </View>
    );
  });
FrequentSubstitutes.displayName = "FrequentSubstitutes";
