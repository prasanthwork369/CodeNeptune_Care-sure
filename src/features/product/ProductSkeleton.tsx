import { Image } from "expo-image";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

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
      contentContainerStyle={{ paddingBottom: exactScale(100) }}
      className="flex-1"
    >
      {/* Image Carousel Mock / Preview */}
      <View className="mb-8 pt-4 items-center">
        {previewImage ? (
          <View
            style={{
              width: imgSize,
              height: imgSize,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#F9FAFB",
              alignItems: "center",
              justifyContent: "center",
            }}
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
        <View className="flex-row items-center justify-center mt-4 gap-x-1.5">
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
      <View className="px-5">
        {previewBrand ? (
          <Text
            numberOfLines={1}
            style={{
              fontSize: moderateScale(12),
              color: "#6B7280",
              marginBottom: exactScale(6),
            }}
            className="font-inter-medium"
          >
            {previewBrand}
          </Text>
        ) : (
          <Skeleton
            width={100}
            height={13}
            style={{ marginBottom: exactScale(8) }}
          />
        )}

        {previewName ? (
          <Text
            numberOfLines={2}
            style={{
              fontSize: moderateScale(18),
              fontWeight: "700",
              color: "#111827",
              marginBottom: exactScale(12),
              lineHeight: moderateScale(24),
            }}
            className="font-inter-bold"
          >
            {previewName}
          </Text>
        ) : (
          <>
            <Skeleton
              width="90%"
              height={24}
              style={{ marginBottom: exactScale(8) }}
            />
            <Skeleton
              width="60%"
              height={24}
              style={{ marginBottom: exactScale(16) }}
            />
          </>
        )}

        {/* Pricing Skeleton - always fresh from API */}
        <View className="flex-row items-baseline gap-x-2 mb-4">
          <Skeleton width={80} height={28} />
          <Skeleton width={60} height={16} />
          <Skeleton width={50} height={16} />
        </View>

        <Skeleton
          width="80%"
          height={12}
          style={{ marginBottom: exactScale(20) }}
        />
      </View>

      <View className="h-[1px] bg-[#F3F4F6] mt-4 mb-4" />

      {/* Variant Banner Mock */}
      <View className="bg-[#F9FAFB] py-4 px-5 mb-6">
        <Skeleton width="40%" height={14} />
      </View>

      {/* Logistics Bar Mock */}
      <View className="mx-5 mb-6 p-4 rounded-xl bg-white border border-[#F3F4F6]">
        <View className="flex-row items-center">
          <Skeleton width={40} height={40} borderRadius={20} />
          <View className="ml-3 flex-1">
            <Skeleton
              width="60%"
              height={14}
              style={{ marginBottom: exactScale(6) }}
            />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      </View>

      {/* Trust Badge Mock */}
      <View className="flex-row px-5 mb-8 justify-between">
        {[1, 2, 3].map((i) => (
          <View key={i} className="items-center">
            <Skeleton
              width={48}
              height={48}
              borderRadius={24}
              style={{ marginBottom: exactScale(8) }}
            />
            <Skeleton width={40} height={10} />
          </View>
        ))}
      </View>

      {/* Know Your Medicine Mock */}
      <View className="px-5 mb-6">
        <Skeleton
          width={160}
          height={20}
          style={{ marginBottom: exactScale(16) }}
        />

        <View className="bg-white rounded-[12px] px-5 py-6 border border-[#E5E7EB]">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className={`flex-row items-center ${i !== 3 ? "mb-6" : ""}`}
            >
              <Skeleton
                width={exactScale(48)}
                height={exactScale(48)}
                borderRadius={6}
                style={{ marginRight: exactScale(16) }}
              />
              <View className="flex-1">
                <Skeleton
                  width={i === 1 ? "60%" : i === 2 ? "45%" : "55%"}
                  height={15}
                  style={{ marginBottom: exactScale(6) }}
                />
                <Skeleton
                  width={i === 1 ? "50%" : i === 2 ? "35%" : "40%"}
                  height={14}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};
