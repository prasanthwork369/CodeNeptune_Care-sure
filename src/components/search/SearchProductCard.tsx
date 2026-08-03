import type { ImageSource } from "expo-image";
import React, { useCallback } from "react";
import { ActivityIndicator, View, Text, Animated } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useCartActions } from "@/src/hooks/useCartActions";
import { moderateScale } from "@/src/utils/exactScale";
import {
  cartCounterStyles as cc,
  searchCardStyles as s,
} from "./search.styles";

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
      price: number | null; // absent when the backend omits a price
      status: string;
    };
    recommended: {
      name: string;
      manufacturer: string;
      price: number | null; // absent when the backend omits a price
      originalPrice: number | null;
      savings: number;
      description?: string;
      image?: ImageSource | null;
      packSize?: string;
      unit?: string;
    };
  };
}

export const SearchProductCard = React.memo(({ data }: SearchRowProps) => {
  const router = useNav();

  const handleCardPress = useCallback(() => {
    router.push({
      pathname: "/search/product/[id]",
      params: { id: data.productId ?? data.id },
    });
  }, [data.productId, data.id, router]);

  const { count, increment, decrement, animations, isPending } = useCartActions(
    {
      medicineId: data.recId || data.id,
      variantId: null,
      productId: data.recProductId || data.productId,
      name: data.recommended.name,
      slug: data.recSlug || data.slug,
      // 0 when the backend sent no price — useCartActions blocks the add.
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
      style={{ borderWidth: 1, borderColor: "#919EAB33" }}
      className="w-full rounded-[12px] bg-white overflow-hidden mb-5"
    >
      {/* Top Section: Split Comparison */}
      <View className="flex-row w-full">
        {/* Left Side (White Background) */}
        <View className="flex-1 p-4">
          <View className="mb-6">
            <Text
              style={s.name}
              className="font-inter-semibold text-brand-text mb-1 leading-snug tracking-tight"
            >
              {data.searched.name}
            </Text>
            {data.searched.description ? (
              <Text
                style={s.desc}
                className="font-inter-medium text-brand-subtext mt-0.5"
                numberOfLines={1}
              >
                {data.searched.description}
              </Text>
            ) : null}
            {data.searched.brandName ? (
              <Text
                style={s.desc}
                className="font-inter-medium text-brand-subtext mt-0.5"
                numberOfLines={1}
              >
                {data.searched.brandName}
              </Text>
            ) : null}
          </View>
          <View className="mt-auto">
            {data.searched.price != null && (
              <Text
                style={s.price}
                className="font-inter-extrabold text-brand-text mb-1.5 tracking-tight"
              >
                ₹{Number(data.searched.price).toFixed(2)}
              </Text>
            )}
            <Text
              style={s.savings}
              className="font-inter-semibold text-[#FF383C] mt-1"
            >
              {data.searched.status}
            </Text>
          </View>
        </View>

        {/* Right Side (Pale Yellow Background) */}
        <View className="flex-1 p-4 bg-[#FFFDEB]">
          <View className="mb-6">
            <Text
              style={s.name}
              className="font-inter-semibold text-brand-text mb-1 leading-snug tracking-tight"
            >
              {data.recommended.name}
            </Text>
            {data.recommended.description ? (
              <Text
                style={s.desc}
                className="font-inter-medium text-brand-subtext mt-0.5"
                numberOfLines={1}
              >
                {data.recommended.description}
              </Text>
            ) : null}
          </View>
          <View className="mt-auto">
            <View
              className="flex-row items-baseline flex-wrap gap-x-2 mb-1.5"
              style={{ rowGap: moderateScale(2) }}
            >
              {data.recommended.price != null && (
                <Text
                  style={[s.price, { lineHeight: moderateScale(20) }]}
                  className="font-inter-extrabold text-brand-text tracking-tight"
                >
                  ₹{Number(data.recommended.price).toFixed(2)}
                </Text>
              )}
              {data.recommended.originalPrice != null &&
                data.recommended.price != null &&
                data.recommended.originalPrice > data.recommended.price && (
                  <Text
                    style={[s.mrp, { lineHeight: moderateScale(16) }]}
                    className="font-inter-semibold text-brand-subtext line-through"
                    numberOfLines={1}
                  >
                    ₹{Number(data.recommended.originalPrice).toFixed(2)}
                  </Text>
                )}
            </View>
            {data.recommended.savings > 0 && (
              <View className="flex-row items-center mt-0.5">
                <icons.sell
                  width={15}
                  height={15}
                  fill="#0F7635"
                  style={s.sellIcon}
                />
                <Text
                  style={s.savings}
                  className="font-inter-bold text-brand-primary ml-1.5 tracking-tight mt-1"
                >
                  Save ₹{Number(data.recommended.savings).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Horizontal Divider Line */}
      <View className="h-[1px] w-full bg-[#EAEAEA]" />

      {/* Bottom Section: Uniform Actions Row */}
      <View className="flex-row justify-between items-center px-4 py-3.5 bg-white">
        <View className="flex-row items-center">
          <icons.check_circle width={18} height={18} fill="#0F7635" />
          <Text
            style={s.sameComp}
            className="font-inter-semibold text-brand-primary ml-2 uppercase tracking-wide"
          >
            SAME COMPOSITION
          </Text>
        </View>

        {count === 0 ? (
          <Touchable
            onPress={handleIncrement}
            disabled={isPending}
            activeOpacity={0.85}
            style={cc.addBtn}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <Text
                style={[cc.addText, { color: "#0F7635" }]}
                className="font-inter-bold"
              >
                Add
              </Text>
            )}
          </Touchable>
        ) : (
          <View
            className="flex-row items-center justify-between rounded-[10px] overflow-hidden"
            style={cc.wrapActive}
          >
            <Touchable
              onPress={handleDecrement}
              disabled={isPending}
              activeOpacity={0.7}
              style={cc.btn}
            >
              <Text
                style={cc.plusMinus}
                className="font-inter-medium text-white leading-none"
              >
                −
              </Text>
            </Touchable>
            <View style={cc.countContainer}>
              {isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Animated.Text
                  style={[
                    cc.countText,
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
              onPress={handleIncrement}
              disabled={isPending}
              activeOpacity={0.7}
              style={cc.btn}
            >
              <Text
                style={cc.plusMinus}
                className="font-inter-medium text-white leading-none"
              >
                +
              </Text>
            </Touchable>
          </View>
        )}
      </View>
    </Touchable>
  );
});

SearchProductCard.displayName = "SearchProductCard";
