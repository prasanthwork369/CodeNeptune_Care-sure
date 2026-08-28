import React from "react";
import { View, ScrollView } from "react-native";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./ProductDetailsSkeleton.styles";

export const ProductDetailsSkeleton = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      overScrollMode="auto"
    >
      {/* Mock SaltCompositionBanner */}
      <View style={s.saltBannerPad}>
        <Skeleton width="80%" height={14} />
      </View>

      {/* Mock ComparisonBoard */}
      <View style={s.boardPad}>
        <View style={s.boardCard}>
          <View style={s.boardSplitRow}>
            {/* Left Side */}
            <View style={s.boardLeftSide}>
              <Skeleton
                width="100%"
                height={120}
                borderRadius={12}
                style={{ marginBottom: exactScale(12) }}
              />
              <Skeleton width="90%" height={18} style={{ marginBottom: exactScale(8) }} />
              <Skeleton width="60%" height={12} style={{ marginBottom: exactScale(16) }} />
              <Skeleton width={80} height={24} />
            </View>
            {/* Right Side */}
            <View style={s.boardRightSide}>
              <Skeleton
                width="100%"
                height={120}
                borderRadius={12}
                style={{ marginBottom: exactScale(12) }}
              />
              <Skeleton width="90%" height={18} style={{ marginBottom: exactScale(8) }} />
              <Skeleton width="60%" height={12} style={{ marginBottom: exactScale(16) }} />
              <Skeleton width={80} height={24} />
            </View>
          </View>
        </View>
      </View>

      {/* Mock LogisticsBar */}
      <View style={s.logisticsPad}>
        <View style={s.logisticsCard}>
          <View style={s.logisticsLeft}>
            <Skeleton width={20} height={20} borderRadius={10} />
            <Skeleton width={150} height={14} style={{ marginLeft: exactScale(12) }} />
          </View>
          <Skeleton width={60} height={14} />
        </View>
      </View>

      {/* Mock TrustBadge */}
      <View style={s.trustPad}>
        <Skeleton width="100%" height={80} borderRadius={12} />
      </View>

      {/* Mock KnowYourMedicine */}
      <View style={s.trustPad}>
        <Skeleton width="100%" height={150} borderRadius={12} />
      </View>

      {/* Mock MoreAboutSection */}
      <View style={s.moreAboutPad}>
        <Skeleton width={150} height={20} style={{ marginBottom: exactScale(16) }} />
        <Skeleton
          width="100%"
          height={100}
          borderRadius={12}
          style={{ marginBottom: exactScale(12) }}
        />
        <Skeleton width="100%" height={100} borderRadius={12} />
      </View>
    </ScrollView>
  );
};
