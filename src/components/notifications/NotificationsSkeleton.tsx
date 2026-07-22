import { exactScale } from '@/src/utils/exactScale';
import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/src/components/ui/Skeleton';

const NotificationRowSkeleton = ({ isLast }: { isLast: boolean }) => (
    <View
        style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: isLast ? 0 : exactScale(20),
        }}
    >
        <View style={{ width: exactScale(56) }}>
            <Skeleton width={40} height={40} borderRadius={20} style={{ marginLeft: exactScale(16) }} />
        </View>
        <View style={{ flex: 1, gap: exactScale(5), marginLeft: exactScale(5) }}>
            <Skeleton width="65%" height={14} borderRadius={4} />
            <Skeleton width="90%" height={12} borderRadius={4} />
            <Skeleton width={60} height={10} borderRadius={4} style={{ marginTop: exactScale(1) }} />
        </View>
        <View style={{ width: exactScale(24), height: exactScale(24), marginLeft: exactScale(34), alignItems: 'center', justifyContent: 'center' }}>
            <Skeleton width={4.25} height={17} borderRadius={2.125} />
        </View>
    </View>
);

const NotificationSectionSkeleton = ({ rows, isFirst = false }: { rows: number; isFirst?: boolean }) => (
    <View style={{ marginTop: exactScale(isFirst ? 12 : 16) }}>
        <Skeleton width={70} height={14} borderRadius={4} style={{ marginBottom: exactScale(16) }} />
        {Array.from({ length: rows }).map((_, i) => (
            <NotificationRowSkeleton key={i} isLast={i === rows - 1} />
        ))}
    </View>
);

export const NotificationsSkeleton = () => (
    <View style={{ paddingHorizontal: exactScale(15) }}>
        <NotificationSectionSkeleton rows={3} isFirst />
        <NotificationSectionSkeleton rows={2} />
    </View>
);
