import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCartActions } from "@/src/features/cart/hooks/useCartActions";
import { usePrefetchProduct } from "@/src/hooks/queries/useProduct";
import { moderateScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { ActivityIndicator, Animated, Text, View } from "react-native";
import {
  cartCounterStyles as cc,
  searchCardStyles as s,
} from "./search.styles";

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
  };
  onPress: (productId: string) => void;
}

export const SearchRecommendCard = React.memo(
  ({ data, onPress }: SearchRecommendCardProps) => {
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
        onPress={() => onPress(data.productId)}
        onPressIn={handlePrefetch}
        style={[s.recCard, { padding: 0, overflow: "hidden", minHeight: 0 }]}
        className="w-full rounded-[16px] mb-4"
      >
        {/* Top Section: Yellow (#FFFDEB) */}
        <View
          style={{ backgroundColor: "#FBFFF2" }}
          className="flex-row items-start p-4 gap-x-3"
        >
          {/* Left: image container */}
          <View
            className="bg-white items-center justify-center"
            style={s.recImgBox}
          >
            {data.thumbnailUrl ? (
              <Image
                source={{ uri: data.thumbnailUrl }}
                style={s.imgInner}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            ) : (
              <icons.placeholder width={64} height={64} />
            )}
          </View>

          {/* Right: info column */}
          <View className="flex-1 justify-start">
            <Text
              style={s.name}
              className="font-inter-bold text-brand-text"
              numberOfLines={2}
            >
              {data.name}
            </Text>
            {packLabel ? (
              <Text
                style={s.desc}
                className="font-inter-normal text-brand-subtext mt-0.5"
                numberOfLines={1}
              >
                {packLabel}
              </Text>
            ) : null}
            {data.manufacturer ? (
              <Text
                style={s.desc}
                className="font-inter-medium text-[#009989] mt-0.5"
                numberOfLines={1}
              >
                {data.manufacturer}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

        {/* Bottom Section: White */}
        <View
          style={{ backgroundColor: "#FFFFFF" }}
          className="flex-row items-center justify-between p-4"
        >
          {/* Price + savings row */}
          <View
            className="flex-row items-center flex-wrap flex-1 mr-2"
            style={{ rowGap: moderateScale(5) }}
          >
            <View className="flex-row items-baseline gap-x-1.5 shrink-0">
              {data.price != null && (
                <Text
                  style={s.price}
                  className="font-inter-extrabold text-brand-text"
                >
                  ₹{Number(data.price).toFixed(2)}
                </Text>
              )}
              {hasSavings && data.mrp != null && (
                <Text
                  style={s.mrp}
                  numberOfLines={1}
                  className="font-inter-medium text-brand-subtext line-through"
                >
                  ₹{Number(data.mrp).toFixed(2)}
                </Text>
              )}
            </View>
            {hasSavings && (
              <View className="flex-row items-center ml-2 shrink-0">
                <icons.sell
                  width={15}
                  height={15}
                  fill="#0F7635"
                  style={s.sellIcon}
                />
                <Text
                  style={[s.savings, { lineHeight: moderateScale(16) }]}
                  className="font-inter-bold text-brand-primary ml-1.5 tracking-tight"
                >
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
                style={cc.addBtn}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#0F7635" />
                ) : (
                  <Text
                    style={[cc.addText, { color: "#0F7635" }]}
                    className="font-inter-bold"
                  >
                    ADD
                  </Text>
                )}
              </Touchable>
            ) : (
              <View
                className="flex-row items-center justify-between rounded-[10px] overflow-hidden"
                style={cc.wrapActive}
              >
                <Touchable
                  onPress={decrement}
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
                  onPress={increment}
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
        </View>
      </Touchable>
    );
  },
);

SearchRecommendCard.displayName = "SearchRecommendCard";
