import { HomeProductCard } from "./HomeProductCard";
import { Image, type ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Product } from "@/src/types/home";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

interface ProductSectionProps {
  title: string;
  subtitle: string;
  headerColor: string;
  subtitleColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  detailsBgColor: string;
  bgColor?: string;
  // LinearGradient needs at least two stops, so these are tuples, not arrays.
  bgGradient?: readonly [string, string, ...string[]];
  bgLocations?: readonly [number, number, ...number[]];
  headerImages: ImageSource[];
  products: Product[];
  onProductPress?: (id: string) => void;
  disableCart?: boolean;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  headerColor,
  subtitleColor,
  badgeBgColor,
  badgeTextColor,
  detailsBgColor,
  bgColor,
  bgGradient,
  bgLocations,
  headerImages,
  products,
  onProductPress,
  disableCart,
}) => {
  const cardWidth = exactScale(164);
  const imageSize = cardWidth * 0.69;
  const cardHeight = imageSize * 1.5 + 160;
  const gap = exactScale(14);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <HomeProductCard
        item={item}
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        imageSize={imageSize}
        badgeBgColor={badgeBgColor}
        badgeTextColor={badgeTextColor}
        detailsBgColor={detailsBgColor}
        buttonColor={subtitleColor}
        onPress={onProductPress}
        disableCart={disableCart}
      />
    ),
    [
      badgeBgColor,
      badgeTextColor,
      cardHeight,
      cardWidth,
      detailsBgColor,
      disableCart,
      imageSize,
      onProductPress,
      subtitleColor,
    ],
  );

  return (
    <View className="mb-6">
      {bgGradient ? (
        <LinearGradient
          colors={bgGradient}
          locations={bgLocations}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View
          style={{ backgroundColor: bgColor }}
          className="absolute top-0 left-0 right-0 bottom-0"
        />
      )}

      <View className="pb-8">
        {/* Header */}
        <View className="px-5 flex-row justify-between items-center mb-6">
          <View className="flex-1 pr-2">
            <Text
              className="font-inter-semibold text-brand-text"
              style={{ fontSize: moderateScale(14) }}
            >
              {title}
            </Text>
            <View className="mt-0.5">
              <Text
                style={{
                  color: subtitleColor,
                  fontSize: moderateScale(18),
                  lineHeight: moderateScale(28),
                }}
                className="font-inter-bold"
              >
                {subtitle}
              </Text>
              <LinearGradient
                colors={[subtitleColor, "rgba(255,255,255,0)"] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: exactScale(3),
                  width: exactScale(140),
                  marginTop: exactScale(4),
                  borderRadius: exactScale(2),
                  opacity: 0.6,
                }}
              />
            </View>
          </View>
          <View className="flex-row items-center gap-x-1">
            {headerImages.map((img, idx) => (
              <Image
                key={idx}
                source={img}
                style={{ width: exactScale(55), height: exactScale(55) }}
                contentFit="contain"
              />
            ))}
          </View>
        </View>

        {/* Product Cards */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          removeClippedSubviews
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          nestedScrollEnabled
          directionalLockEnabled
          style={{ height: cardHeight }}
          contentContainerStyle={{
            paddingLeft: exactScale(20),
            paddingRight: exactScale(40),
          }}
          ItemSeparatorComponent={() => <View style={{ width: gap }} />}
        />
      </View>
    </View>
  );
};
