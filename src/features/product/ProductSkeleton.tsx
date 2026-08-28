import { Image } from "expo-image";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./ProductSkeleton.styles";

interface ProductSkeletonProps {
  previewName?: string;
  previewImage?: string;
  previewBrand?: string;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({
  previewName,
  previewImage,
  previewBrand,
}) => {
  const imgSize = exactScale(215);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scrollContent}
      style={s.scrollView}
    >
      {/* Image Carousel Mock / Preview */}
      <View style={s.carouselMock}>
        {previewImage ? (
          <View
            style={[
              s.previewImageBox,
              {
                width: imgSize,
                height: imgSize,
              },
            ]}
          >
            <Image
              source={{ uri: previewImage }}
              style={{ width: imgSize, height: imgSize }}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        ) : (
          <Skeleton width={imgSize} height={imgSize} borderRadius={16} />
        )}
        <View style={s.dotsRow}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width={i === 1 ? 18 : 8}
              height={5}
              borderRadius={3}
            />
          ))}
        </View>
      </View>

      {/* Product Details Mock / Preview */}
      <View style={s.detailsSection}>
        {previewBrand ? (
          <Text
            numberOfLines={1}
            style={s.brandText}
          >
            {previewBrand}
          </Text>
        ) : (
          <Skeleton
            width={100}
            height={13}
            style={s.brandSkeleton}
          />
        )}

        {previewName ? (
          <Text
            numberOfLines={2}
            style={s.nameText}
          >
            {previewName}
          </Text>
        ) : (
          <>
            <Skeleton
              width="90%"
              height={24}
              style={s.nameSkeleton1}
            />
            <Skeleton
              width="60%"
              height={24}
              style={s.nameSkeleton2}
            />
          </>
        )}

        {/* Pricing Skeleton - always fresh from API */}
        <View style={s.pricingRow}>
          <Skeleton width={80} height={28} />
          <Skeleton width={60} height={16} />
          <Skeleton width={50} height={16} />
        </View>

        <Skeleton
          width="80%"
          height={12}
          style={s.subtitleSkeleton}
        />
      </View>

      <View style={s.divider} />

      {/* Variant Banner Mock */}
      <View style={s.variantBannerMock}>
        <Skeleton width="40%" height={14} />
      </View>

      {/* Logistics Bar Mock */}
      <View style={s.logisticsCardMock}>
        <View style={s.logisticsRow}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <View style={s.logisticsTextCol}>
            <Skeleton
              width="60%"
              height={14}
              style={s.logisticsLine1}
            />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      </View>

      {/* Trust Badge Mock */}
      <View style={s.trustBadgeRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={s.trustBadgeItem}>
            <Skeleton
              width={48}
              height={48}
              borderRadius={24}
              style={s.trustBadgeIcon}
            />
            <Skeleton width={40} height={10} />
          </View>
        ))}
      </View>

      {/* Bottom Action Button Mock */}
      <View style={s.footerMock}>
        <Skeleton width="100%" height={48} borderRadius={12} />
      </View>
    </ScrollView>
  );
};
