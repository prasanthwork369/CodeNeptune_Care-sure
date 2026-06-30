import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useCartActions } from "@/src/hooks/useCartActions";
import React from "react";
import { ActivityIndicator, Animated, Image, Text, View } from "react-native";
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
    price: number | null;
    mrp: number | null;
    discountPercentage: number;
    thumbnailUrl?: string;
  };
  onPress: (productId: string) => void;
}

export const SearchRecommendCard: React.FC<SearchRecommendCardProps> = ({
  data,
  onPress,
}) => {
  const savings =
    data.mrp != null && data.price != null ? data.mrp - data.price : 0;
  const hasSavings = savings > 0;
  const base = [data.packSize?.trim(), data.unit].filter(Boolean).join(" ");
  const packLabel = data.dosageForm ? `${base} ${data.dosageForm}` : base;

  const { count, increment, decrement, isPending, animations } = useCartActions(
    {
      medicineId: data.id,
      variantId: null,
      productId: data.productId,
      name: data.name,
      price: data.price ?? 0,
      originalPrice: data.mrp ?? data.price ?? 0,
      discountPercent: data.discountPercentage ?? 0,
    },
  );
  const { slideAnim, opacityAnim } = animations;

  return (
    <Touchable
      activeOpacity={0.85}
      onPress={() => onPress(data.productId)}
      style={[s.recCard, { padding: 0, overflow: 'hidden', minHeight: 0 }]}
      className="w-full rounded-[16px] mb-4"
    >
      {/* Top Section: Yellow (#FFFDEB) */}
      <View
        style={{ backgroundColor: '#FFFDEB' }}
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
              resizeMode="contain"
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
              className="font-inter-medium text-brand-subtext mt-0.5"
              numberOfLines={1}
            >
              {data.manufacturer}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: '#E5E7EB' }} />

      {/* Bottom Section: White */}
      <View
        style={{ backgroundColor: '#FFFFFF' }}
        className="flex-row items-center justify-between p-4"
      >
        {/* Price + savings row */}
        <View className="flex-row items-center flex-wrap flex-1 mr-2">
          <View className="flex-row items-baseline gap-x-2">
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
                className="font-inter-medium text-brand-subtext line-through"
              >
                ₹{Number(data.mrp).toFixed(1)}
              </Text>
            )}
          </View>
          {hasSavings && (
            <View className="flex-row items-center ml-3">
              <icons.sell width={15} height={15} fill="#0F7635" style={s.sellIcon} />
              <Text
                style={s.savings}
                className="font-inter-bold text-brand-primary ml-1.5 tracking-tight"
              >
                Save ₹{Number(savings).toFixed(0)}
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
};
