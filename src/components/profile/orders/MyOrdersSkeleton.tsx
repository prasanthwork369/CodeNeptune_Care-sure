import React from 'react';
import { ScrollView, View } from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { Skeleton } from '@/src/components/ui/Skeleton';

function OrderCardSkeleton() {
    return (
        <View
            style={{
                backgroundColor: '#fff',
                borderRadius: 14,
                marginHorizontal: 16,
                marginBottom: 12,
            }}
        >
            {/* Top: dates + badge */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 10,
                }}
            >
                <View style={{ flexDirection: 'row', gap: 20 }}>
                    <View style={{ gap: 6 }}>
                        <Skeleton width={80} height={10} borderRadius={4} />
                        <Skeleton width={90} height={14} borderRadius={4} />
                    </View>
                    <View style={{ gap: 6 }}>
                        <Skeleton width={60} height={10} borderRadius={4} />
                        <Skeleton width={100} height={14} borderRadius={4} />
                    </View>
                </View>
                <Skeleton width={72} height={28} borderRadius={6} />
            </View>

            {/* Items count */}
            <Skeleton width={60} height={10} borderRadius={4} style={{ marginHorizontal: 16, marginBottom: 10 }} />

            {/* Thumbnails */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 14 }}>
                {[0, 1, 2, 3, 4].map(i => (
                    <Skeleton key={i} style={{ flex: 1, aspectRatio: 1, maxWidth: 62 }} borderRadius={8} />
                ))}
            </View>

            {/* Delivery date */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 14, gap: 6 }}>
                <Skeleton width={70} height={10} borderRadius={4} />
                <Skeleton width={110} height={13} borderRadius={4} />
            </View>

            {/* Divider + buttons */}
            <View style={{ height: 1, backgroundColor: '#919EAB33' }} />
            <View style={{ flexDirection: 'row', paddingVertical: 14 }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Skeleton width={100} height={14} borderRadius={4} />
                </View>
                <View style={{ width: 1, backgroundColor: '#919EAB33' }} />
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Skeleton width={90} height={14} borderRadius={4} />
                </View>
            </View>
        </View>
    );
}

export const MyOrdersSkeleton: React.FC = () => {
    const adjustedBottom = useAdjustedBottomInset();

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: adjustedBottom + 24,
            }}
        >
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
        </ScrollView>
    );
};
