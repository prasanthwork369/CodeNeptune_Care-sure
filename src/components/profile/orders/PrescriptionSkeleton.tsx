import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/src/components/ui/Skeleton';

export const PrescriptionCardSkeleton = () => (
  <View
    className="bg-white mb-4 p-4"
    style={{ borderWidth: 1, borderColor: "#DFE3E8", borderRadius: 12 }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Skeleton width={40} height={40} borderRadius={8} style={{ marginRight: 12 }} />
        <View style={{ gap: 6 }}>
          <Skeleton width={140} height={16} borderRadius={4} />
          <Skeleton width={90} height={12} borderRadius={4} />
        </View>
      </View>
      <Skeleton width={20} height={20} borderRadius={10} />
    </View>

    <View style={{ gap: 12, marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Skeleton width={16} height={16} borderRadius={8} style={{ marginRight: 10 }} />
        <Skeleton width={100} height={12} borderRadius={4} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Skeleton width={16} height={16} borderRadius={8} style={{ marginRight: 10 }} />
        <Skeleton width={130} height={12} borderRadius={4} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Skeleton width={16} height={16} borderRadius={8} style={{ marginRight: 10 }} />
        <Skeleton width={110} height={12} borderRadius={4} />
      </View>
    </View>

    <View style={{ height: 1, backgroundColor: "#F0F0F0", marginBottom: 14 }} />

    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Skeleton width={44} height={24} borderRadius={12} style={{ marginRight: 8 }} />
        <Skeleton width={95} height={14} borderRadius={4} />
      </View>
      <Skeleton width={75} height={34} borderRadius={8} />
    </View>
  </View>
);

export const RxOrdersSkeleton = () => (
  <View style={{ padding: 16 }}>
    <PrescriptionCardSkeleton />
    <PrescriptionCardSkeleton />
    <PrescriptionCardSkeleton />
  </View>
);
