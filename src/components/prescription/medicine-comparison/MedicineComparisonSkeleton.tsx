import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, View } from "react-native";

export const MedicineComparisonSkeleton: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
      <ScreenHeader title="Medicine Comparison" showBorder />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(16),
          paddingBottom: exactScale(32),
          gap: exactScale(14),
        }}
      >
        {/* Savings banner skeleton */}
        <ShimmerBlock height={exactScale(64)} borderRadius={12} />

        {/* Comparison card 1 skeleton */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#919EAB33",
            padding: exactScale(16),
            gap: exactScale(12),
          }}
        >
          <ShimmerBlock height={exactScale(24)} width="50%" borderRadius={6} />
          <View style={{ flexDirection: "row", gap: exactScale(12) }}>
            <View style={{ flex: 1, gap: exactScale(8) }}>
              <ShimmerBlock height={exactScale(80)} borderRadius={8} />
              <ShimmerBlock height={exactScale(16)} width="80%" borderRadius={4} />
              <ShimmerBlock height={exactScale(20)} width="60%" borderRadius={4} />
            </View>
            <View style={{ flex: 1, gap: exactScale(8) }}>
              <ShimmerBlock height={exactScale(80)} borderRadius={8} />
              <ShimmerBlock height={exactScale(16)} width="80%" borderRadius={4} />
              <ShimmerBlock height={exactScale(20)} width="60%" borderRadius={4} />
            </View>
          </View>
        </View>

        {/* Comparison card 2 skeleton */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#919EAB33",
            padding: exactScale(16),
            gap: exactScale(12),
          }}
        >
          <ShimmerBlock height={exactScale(24)} width="50%" borderRadius={6} />
          <View style={{ flexDirection: "row", gap: exactScale(12) }}>
            <View style={{ flex: 1, gap: exactScale(8) }}>
              <ShimmerBlock height={exactScale(80)} borderRadius={8} />
              <ShimmerBlock height={exactScale(16)} width="80%" borderRadius={4} />
              <ShimmerBlock height={exactScale(20)} width="60%" borderRadius={4} />
            </View>
            <View style={{ flex: 1, gap: exactScale(8) }}>
              <ShimmerBlock height={exactScale(80)} borderRadius={8} />
              <ShimmerBlock height={exactScale(16)} width="80%" borderRadius={4} />
              <ShimmerBlock height={exactScale(20)} width="60%" borderRadius={4} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
