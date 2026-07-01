import { exactScale } from '@/src/utils/exactScale';
import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/src/components/ui/Skeleton';

const NotificationRowSkeleton = ({ isLast }: { isLast: boolean }) => (
    <View
        style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: exactScale(14),
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: '#F0F1F3',
        }}
    >
        <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: exactScale(12) }} />
        <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="65%" height={14} borderRadius={4} />
            <Skeleton width="90%" height={12} borderRadius={4} />
            <Skeleton width={60} height={10} borderRadius={4} style={{ marginTop: exactScale(2) }} />
        </View>
        <Skeleton width={4} height={15} borderRadius={2} style={{ marginLeft: exactScale(8), marginTop: exactScale(4) }} />
    </View>
);

const NotificationSectionSkeleton = ({ rows }: { rows: number }) => (
    <View style={{ marginTop: exactScale(18) }}>
        <Skeleton width={70} height={12} borderRadius={4} style={{ marginBottom: exactScale(10) }} />
        {Array.from({ length: rows }).map((_, i) => (
            <NotificationRowSkeleton key={i} isLast={i === rows - 1} />
        ))}
    </View>
);

export const NotificationsSkeleton = () => (
    <View style={{ paddingHorizontal: exactScale(16) }}>
        <NotificationSectionSkeleton rows={3} />
        <NotificationSectionSkeleton rows={2} />
    </View>
);
