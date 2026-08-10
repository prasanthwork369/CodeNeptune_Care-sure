import { useFlyToCartTrigger } from "@/src/components/animations/flyToCart";
import { Touchable } from "@/src/components/ui/Touchable";
import { OfferShine } from "@/src/components/ui/offerShine";
import { icons } from "@/src/constants/icons";
import { useCartActions } from "@/src/hooks/useCartActions";
import { CategoryProductCardProps } from "@/src/types/category";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import {
  CARD_BTN_H,
  CARD_BTN_SW,
  CARD_BTN_W,
  categoryCardStyles as s,
} from "../../categories.styles";

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

  const handleIncrement = async () => {
    // Only animate on a confirmed add: offline the increment refuses and a
    // fly-in would falsely show the item landing in the cart.
    const added = await increment();
    // Priceless rows are placeholders from the API — nothing to fly.
    if (added && Number(product.price) > 0) triggerFly();
  };

  return (
    <View style={{ width: cardWidth, marginBottom: exactScale(20) }}>
      <View style={{ position: "relative" }}>
        {/* Image container */}
        <Touchable
          activeOpacity={0.7}
          onPress={handlePress}
          style={{
            height: cardWidth * 1.05,
            backgroundColor: "#FFFFFF",
            borderRadius: 14,
            borderWidth: 0.77,
            borderColor: "#919EAB33",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <View
            ref={imageRef}
            style={{
              width: "78%",
              height: "68%",
              alignItems: "center",
              justifyContent: "center",
            }}
            collapsable={false}
          >
            {product.image ? (
              <Image
                source={product.image}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
              />
            ) : (
              <icons.placeholder width="78%" height="68%" />
            )}
          </View>
        </Touchable>

        {/* Add / Counter — bottom right corner */}
        <View style={{ position: "absolute", bottom: 10, right: 10 }}>
          {count === 0 ? (
            <Touchable
              activeOpacity={0.8}
              onPress={handleIncrement}
              disabled={isPending}
              style={{
                width: CARD_BTN_W,
                height: CARD_BTN_H,
                backgroundColor: "#FFFFFF",
                borderWidth: 1.5,
                borderColor: "#0F7635",
                borderRadius: 4,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#0F7635" />
              ) : (
                <Text style={s.addText}>Add</Text>
              )}
            </Touchable>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#0F7635",
                borderRadius: 10,
                overflow: "hidden",
                width: CARD_BTN_W,
                height: CARD_BTN_H,
              }}
            >
              <Touchable
                onPress={decrement}
                disabled={isPending}
                style={{
                  width: CARD_BTN_SW,
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={s.plusMinus}>−</Text>
              </Touchable>

              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
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
                onPress={handleIncrement}
                disabled={isPending}
                style={{
                  width: CARD_BTN_SW,
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={s.plus}>+</Text>
              </Touchable>
            </View>
          )}
        </View>
      </View>

      {/* Info below card */}
      <View style={{ marginTop: exactScale(14) }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: exactScale(8),
            marginBottom: exactScale(12),
          }}
        >
          <View
            style={{
              backgroundColor: "#349638",
              borderRadius: 8,
              borderLeftWidth: 2,
              borderBottomWidth: 2,
              borderLeftColor: "#113D24",
              borderBottomColor: "#113D24",
              borderTopWidth: 0,
              borderRightWidth: 0,
              paddingHorizontal: exactScale(4),
              paddingVertical: exactScale(6),
            }}
          >
            <Text style={s.price}>₹{Number(product.price).toFixed(2)}</Text>
          </View>
          {!!product.originalPrice && product.originalPrice > product.price && (
            <Text style={s.mrp}>
              ₹{Number(product.originalPrice).toFixed(2)}
            </Text>
          )}
          {!!product.discount && (
            <LinearGradient
              colors={["#C4F15619", "#50B53B19"]} // 10% opacity via 8-digit hex (0x19 ≈ 0.098, closest match)
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.1 }} // slight y-offset approximates the 92.48deg angle vs. a flat 90deg
              style={{
                borderRadius: exactScale(4),
                overflow: "hidden",
                position: "relative",
              }}
            >
              <View
                style={{
                  alignSelf: "flex-start",
                  paddingHorizontal: exactScale(2),
                  paddingVertical: exactScale(4),
                }}
              >
                <Text style={s.discount}>{product.discount}</Text>
              </View>
              <OfferShine borderRadius={exactScale(4)} />
            </LinearGradient>
          )}
        </View>

        <Text
          style={[s.name, { marginBottom: exactScale(8) }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <Text
          style={[s.desc, { marginBottom: exactScale(4) }]}
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
