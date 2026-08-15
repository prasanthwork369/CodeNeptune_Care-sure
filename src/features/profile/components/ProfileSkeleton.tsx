import React from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { LinearGradient } from "expo-linear-gradient";

export const ProfileSkeleton = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-[#F5F6FB]"
    >
      {/* Header Skeleton */}
      <LinearGradient
        colors={["#C8EADA", "#F9FAFB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          alignItems: "center",
          paddingTop: Math.max(insets.top, 20) + 8,
          paddingBottom: 60,
        }}
      >
        <Skeleton
          width={88}
          height={88}
          borderRadius={44}
          style={{ borderWidth: 2, borderColor: "white" }}
        />
        <Skeleton width={150} height={20} style={{ marginTop: 16 }} />
        <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
      </LinearGradient>

      {/* Quick Action Tiles Skeleton */}
      <View className="flex-row mx-4 gap-[10px]" style={{ marginTop: -44 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="flex-1 bg-white rounded-xl py-[14px] items-center border border-[#919EAB33]"
          >
            <Skeleton width={24} height={24} style={{ marginBottom: 10 }} />
            <Skeleton width={60} height={10} style={{ marginBottom: 4 }} />
            <Skeleton width={40} height={10} />
          </View>
        ))}
      </View>

      {/* CareSure Coins Card Skeleton */}
      <View className="mx-4 mt-[14px] rounded-xl overflow-hidden bg-white border border-[#919EAB33]">
        <LinearGradient
          colors={["#FDF5FF", "#E7F3FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-5 pt-5 pb-7"
        >
          <Skeleton width={200} height={24} style={{ marginBottom: 8 }} />
          <Skeleton width={140} height={16} />
        </LinearGradient>
        <View className="px-5 py-4">
          <Skeleton width={180} height={16} style={{ marginBottom: 8 }} />
          <Skeleton width={120} height={14} />
        </View>
      </View>

      {/* Information List Skeleton */}
      <View className="mx-4 my-6">
        <Skeleton width={150} height={18} style={{ marginBottom: 12 }} />
        <View className="bg-white rounded-xl border border-[#919EAB33] overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              className="flex-row items-center px-4 py-[18px] border-b border-[#EEEFF1]"
            >
              <Skeleton width={22} height={22} borderRadius={4} />
              <Skeleton width={150} height={14} style={{ marginLeft: 14 }} />
              <View className="flex-1" />
              <Skeleton width={12} height={12} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};
