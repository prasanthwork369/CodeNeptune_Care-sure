import React from "react";
import { View, ScrollView } from "react-native";
import { Skeleton } from "../../../ui/Skeleton";

export const ProductDetailsSkeleton = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1"
      bounces={false}
    >
      {/* Mock SaltCompositionBanner */}
      <View className="px-4 py-3">
        <Skeleton width="80%" height={14} />
      </View>

      {/* Mock ComparisonBoard */}
      <View className="px-4 py-6">
        <View className="bg-white rounded-2xl border border-[#919EAB33] overflow-hidden">
          <View className="flex-row">
            {/* Left Side */}
            <View className="flex-1 p-4 border-r border-[#919EAB33]">
              <Skeleton
                width="100%"
                height={120}
                borderRadius={12}
                style={{ marginBottom: 12 }}
              />
              <Skeleton width="90%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={12} style={{ marginBottom: 16 }} />
              <Skeleton width={80} height={24} />
            </View>
            {/* Right Side */}
            <View className="flex-1 p-4">
              <Skeleton
                width="100%"
                height={120}
                borderRadius={12}
                style={{ marginBottom: 12 }}
              />
              <Skeleton width="90%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={12} style={{ marginBottom: 16 }} />
              <Skeleton width={80} height={24} />
            </View>
          </View>
        </View>
      </View>

      {/* Mock LogisticsBar */}
      <View className="px-4 mb-6">
        <View className="bg-white rounded-xl border border-[#919EAB33] p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Skeleton width={20} height={20} borderRadius={10} />
            <Skeleton width={150} height={14} style={{ marginLeft: 12 }} />
          </View>
          <Skeleton width={60} height={14} />
        </View>
      </View>

      {/* Mock TrustBadge */}
      <View className="px-4 mb-6">
        <Skeleton width="100%" height={80} borderRadius={12} />
      </View>

      {/* Mock KnowYourMedicine */}
      <View className="px-4 mb-6">
        <Skeleton width="100%" height={150} borderRadius={12} />
      </View>

      {/* Mock MoreAboutSection */}
      <View className="px-4 mb-20">
        <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />
        <Skeleton
          width="100%"
          height={100}
          borderRadius={12}
          style={{ marginBottom: 12 }}
        />
        <Skeleton width="100%" height={100} borderRadius={12} />
      </View>
    </ScrollView>
  );
};
