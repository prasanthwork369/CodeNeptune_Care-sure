import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/features/product/hooks/useProduct";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import { styles as s } from "./SearchRecommendCard.styles";

interface SearchRecommendCardProps {
  data: {
    id: string;
    productId: string;
    name: string;
    manufacturer?: string;
    packSize: string;
    unit: string;
    dosageForm: string;
    packagingDetail?: string | null;
    price: number | null;
    mrp: number | null;
    discountPercentage: number;
    thumbnailUrl?: string;
    packLabel?: string;
  };
  onPress: (
    id: string,
    name?: string,
    image?: string,
    brand?: string,
  ) => void;
}

export const SearchRecommendCard: React.FC<SearchRecommendCardProps> =
  React.memo(({ data, onPress }) => {
    const savings =
      data.mrp != null && data.price != null ? data.mrp - data.price : 0;
    const hasSavings = savings > 0;
    const packLabel =
      data.packagingDetail ||
      [
        data.packSize?.trim(),
        data.unit,
        data.dosageForm ? `in ${data.dosageForm}` : "",
      ]
        .filter(Boolean)
        .join(" ");

    const { count, increment, decrement, isPending, animations } =
      useCartActions({
        medicineId: data.id,
        variantId: null,
        productId: data.productId,
        name: data.name,
        price: data.price ?? 0,
        originalPrice: data.mrp ?? data.price ?? 0,
        discountPercent: data.discountPercentage ?? 0,
        packSize: data.packSize,
        unit: data.unit,
      });
    const { slideAnim, opacityAnim } = animations;

    const prefetchProduct = usePrefetchProduct();
    const handlePrefetch = useCallback(() => {
      if (data.productId) prefetchProduct(data.productId);
    }, [prefetchProduct, data.productId]);

    return (
      <Touchable
        activeOpacity={0.85}
        onPress={() =>
          onPress(
            data.productId,
            data.name,
            data.thumbnailUrl || undefined,
            data.manufacturer || undefined,
          )
        }
        onPressIn={handlePrefetch}
        style={s.cardRoot}
      >
        {/* Top Section */}
        <View style={s.topSection}>
          {/* Left: image container */}
          <View style={s.imgBox}>
            {data.thumbnailUrl ? (
              <Image
                source={{ uri: data.thumbnailUrl }}
                style={s.imgInner}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            ) : (
              <icons.placeholder width={exactScale(64)} height={exactScale(64)} />
            )}
          </View>

          {/* Right: info column */}
          <View style={s.infoCol}>
            <Text style={s.name} numberOfLines={2}>
              {data.name}
            </Text>
            {packLabel ? (
              <Text style={s.desc} numberOfLines={1}>
                {packLabel}
              </Text>
            ) : null}
            {data.manufacturer ? (
              <Text style={s.descManufacturer} numberOfLines={1}>
                {data.manufacturer}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Bottom Section */}
        <View style={s.bottomSection}>
          {/* Price + savings row */}
          <View style={s.priceRow}>
            <View style={s.priceBaseRow}>
              {data.price != null && (
                <Text style={s.price}>
                  ₹{Number(data.price).toFixed(2)}
                </Text>
              )}
              {hasSavings && data.mrp != null && (
                <Text style={s.mrp} numberOfLines={1}>
                  ₹{Number(data.mrp).toFixed(2)}
                </Text>
              )}
            </View>
            {hasSavings && (
              <View style={s.savingsRow}>
                <icons.sell
                  width={exactScale(15)}
                  height={exactScale(15)}
                  fill="#0F7635"
                  style={s.sellIcon}
                />
                <Text style={s.savingsText}>
                  Save ₹{Number(savings).toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Add / stepper */}
          <View>
            {count === 0 ? (
              <Touchable
                onPress={increment}
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
                  onPress={decrement}
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
                  onPress={increment}
                  disabled={isPending}
                  activeOpacity={0.7}
                  style={s.btn}
                >
                  <Text style={s.plusMinus}>+</Text>
                </Touchable>
              </View>
            )}
          </View>
        </View>
      </Touchable>
    );
  },
);

SearchRecommendCard.displayName = "SearchRecommendCard";
