import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/src/components/ui/Skeleton";

export const PatientSkeleton = () => {
  return (
    <View
      className="flex-1 bg-white overflow-hidden"
      style={{ borderWidth: 1, borderColor: "#EEF0F2", borderRadius: 12 }}
    >
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className="bg-white flex-row items-center"
          style={{
            paddingHorizontal: 10,
            paddingVertical: 14,
            borderBottomWidth: i < 4 ? 1 : 0,
            borderBottomColor: "#DDE2E6",
            borderStyle: "dashed",
          }}
        >
          {/* Avatar */}
          <Skeleton
            width={48}
            height={48}
            borderRadius={24}
            style={{ marginRight: 12 }}
          />

          {/* Info */}
          <View className="flex-1">
            <Skeleton width="60%" height={15} style={{ marginBottom: 8 }} />
            <View className="flex-row items-center gap-x-2">
              <Skeleton width={40} height={12} />
              <Skeleton width={60} height={18} borderRadius={9} />
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row items-center">
            <View
              style={{
                width: 1,
                height: 16,
                backgroundColor: "#E1E5E8",
                marginRight: 8,
              }}
            />
            <Skeleton width={30} height={12} style={{ marginRight: 12 }} />
            <Skeleton width={20} height={20} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

export const PatientChipSkeleton = () => {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="px-[14px] py-[9px] rounded-lg border border-[#E0E0E0] bg-white"
        >
          <Skeleton width={80} height={14} />
        </View>
      ))}
    </>
  );
};
