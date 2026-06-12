import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/src/components/ui/Skeleton';

const NotificationCardSkeleton = () => (
    <View className="bg-white rounded-2xl p-4 mb-3" style={{ borderWidth: 1, borderColor: '#F0F1F3' }}>
        <View className="flex-row items-start">
            <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, gap: 6 }}>
                <Skeleton width="70%" height={14} borderRadius={4} />
                <Skeleton width="90%" height={12} borderRadius={4} />
                <Skeleton width={80} height={11} borderRadius={4} style={{ marginTop: 2 }} />
            </View>
        </View>
    </View>
);

export const NotificationsSkeleton = () => (
    <View style={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-4 mb-3" style={{ borderWidth: 1, borderColor: '#F0F1F3' }}>
            <View className="flex-row items-center">
                <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
                <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton width="60%" height={14} borderRadius={4} />
                    <Skeleton width="80%" height={12} borderRadius={4} />
                </View>
                <Skeleton width={70} height={22} borderRadius={999} style={{ marginLeft: 10 }} />
            </View>
        </View>

        <NotificationCardSkeleton />
        <NotificationCardSkeleton />
        <NotificationCardSkeleton />
    </View>
);
