import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import { icons } from "@/src/constants/icons";
import { CART_BUTTON_HEIGHT } from "@/src/constants/theme";
import { useCartActions } from "@/src/hooks/useCartActions";
import { useHeroTransitionStore } from "@/src/store/heroTransitionStore";
import { Product } from "@/src/types/home";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React, { useCallback, useRef } from "react";
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
    const cardRef = useRef<View>(null);
    // Selector, not the whole store: writing originRect on press would otherwise
    // re-render every mounted card in the frame that starts the navigation.
    const setOriginRect = useHeroTransitionStore((s) => s.setOriginRect);

    const handleCardPress = useCallback(() => {
      if (!onPress) return;
      cardRef.current?.measureInWindow((x, y, width, height) => {
        setOriginRect({ x, y, width, height });
        onPress(item.id);
      });
    }, [onPress, item.id, setOriginRect]);

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
        ref={cardRef}
        className="rounded-[12px] overflow-hidden bg-transparent"
        style={{
          width: cardWidth,
          height: cardHeight,
          borderWidth: 0.77,
          borderColor: "#919EAB33",
        }}
      >
        {/* Tappable area → product detail */}
        <Touchable
          activeOpacity={0.85}
          onPress={handleCardPress}
          style={{ flex: 1 }}
        >
          {/* Image */}
          <View
            style={{ height: imageSize * 1.5 }}
            className="bg-white items-center justify-center"
          >
            {!!item.discount && (
              <View
                style={{ backgroundColor: badgeBgColor }}
                className="absolute top-2 left-3 px-2 py-0.5 rounded z-10"
              >
                <Text
                  style={[s.badgeText, { color: badgeTextColor }]}
                  className="font-inter-bold"
                >
                  {item.discount}
                </Text>
                <OfferShine borderRadius={exactScale(4)} />
              </View>
            )}
            {item.image ? (
              <Image
                source={item.image as any}
                style={{ width: imageSize, height: imageSize }}
                contentFit="contain"
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
            style={{ backgroundColor: detailsBgColor }}
            className="flex-1 px-3 pt-3"
          >
            <Text
              numberOfLines={2}
              style={s.name}
              className="font-inter-medium text-brand-text"
            >
              {item.name}
            </Text>
            <Text
              style={s.description}
              className="font-inter-medium text-brand-subtext mt-1"
            >
              {item.description}
            </Text>
            <View className="flex-row items-center gap-x-1.5 mt-2">
              <Text style={s.price} className="font-inter-bold text-[#0F172A]">
                ₹{Number(item.price).toFixed(2)}
              </Text>
              {!!item.originalPrice && item.originalPrice > item.price && (
                <View className="flex-row items-center">
                  <Text
                    style={s.mrpLabel}
                    className="font-inter text-brand-subtext mr-1"
                  >
                    MRP
                  </Text>
                  <Text
                    style={s.mrpValue}
                    className="font-inter text-brand-subtext line-through"
                  >
                    ₹{Number(item.originalPrice).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Touchable>

        {/* Cart button — NOT inside the card TouchableOpacity */}
        <View style={{ backgroundColor: detailsBgColor }} className="px-3 pb-3">
          {count === 0 ? (
            <Touchable
              activeOpacity={0.85}
              onPress={disableCart ? undefined : increment}
              disabled={isPending || disableCart}
              className="rounded-[10px] items-center justify-center bg-white"
              style={{
                height: CART_BUTTON_HEIGHT,
                borderWidth: 1,
                borderColor: buttonColor,
              }}
            >
              <Text
                style={[s.addToCart, { color: buttonColor }]}
                className="font-inter-bold"
              >
                {isPending ? "Adding..." : "Add to Cart"}
              </Text>
            </Touchable>
          ) : (
            <View
              className="flex-row items-center justify-between rounded-[10px]"
              style={{
                height: CART_BUTTON_HEIGHT,
                backgroundColor: buttonColor,
              }}
            >
              <Touchable
                onPress={decrement}
                disabled={isPending}
                activeOpacity={0.7}
                className="flex-1 h-full items-center justify-center"
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
                  width: s.counterVal.width,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
                    className="font-inter-bold text-white text-center"
                  >
                    {count}
                  </Animated.Text>
                )}
              </View>
              <Touchable
                onPress={increment}
                disabled={isPending}
                activeOpacity={0.7}
                className="flex-1 h-full items-center justify-center"
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
    );
  },
);
HomeProductCard.displayName = "HomeProductCard";
