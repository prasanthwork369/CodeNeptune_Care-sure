import React from 'react';
import { ScrollView, View } from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { Skeleton } from '@/src/components/ui/Skeleton';

const LINE_HEIGHT = 32;

function SkeletonCard({ children, style }: { children: React.ReactNode; style?: any }) {
    return (
        <View
            style={[
                {
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    marginHorizontal: 16,
                    borderWidth: 1,
                    borderColor: '#F0F1F3',
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

function TrackingStepSkeleton({ isLast }: { isLast: boolean }) {
    return (
        <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
            <View style={{ width: 22, alignItems: 'center' }}>
                <Skeleton width={16} height={16} borderRadius={8} style={{ marginTop: 2 }} />
                {!isLast && (
                    <View
                        style={{
                            width: 2,
                            height: LINE_HEIGHT,
                            marginTop: 3,
                            backgroundColor: '#E8EAED',
                            borderRadius: 1,
                        }}
                    />
                )}
            </View>
            <View style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 8 : 16 }}>
                <Skeleton width={120} height={13} borderRadius={4} />
                <Skeleton width={80} height={11} borderRadius={4} style={{ marginTop: 5 }} />
            </View>
        </View>
    );
}

function ItemRowSkeleton({ isLast }: { isLast: boolean }) {
    return (
        <>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 }}>
                <Skeleton width={72} height={72} borderRadius={8} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Skeleton width={140} height={13} borderRadius={4} />
                        <Skeleton width={48} height={13} borderRadius={4} />
                    </View>
                    <Skeleton width={100} height={12} borderRadius={4} style={{ marginTop: 6 }} />
                    <Skeleton width={52} height={26} borderRadius={6} style={{ marginTop: 8 }} />
                </View>
            </View>
            {!isLast && (
                <View
                    style={{
                        height: 1,
                        backgroundColor: '#E5E7EB',
                        marginHorizontal: 20,
                    }}
                />
            )}
        </>
    );
}

export const OrderTrackingSkeleton: React.FC = () => {
    const adjustedBottom = useAdjustedBottomInset();

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{
                paddingTop: 12,
                paddingBottom: Math.max(adjustedBottom, 16) + 16,
                gap: 10,
            }}
        >
            {/* Date + status badge */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 16 }}>
                <Skeleton width={110} height={12} borderRadius={4} />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 }}>
                    <Skeleton width={130} height={22} borderRadius={4} />
                    <Skeleton width={80} height={24} borderRadius={6} />
                </View>
            </View>

            {/* Order Tracking card */}
            <SkeletonCard style={{ paddingTop: 16, paddingBottom: 8 }}>
                <Skeleton width={130} height={14} borderRadius={4} style={{ marginHorizontal: 16, marginBottom: 16 }} />
                {[0, 1, 2, 3, 4].map(i => (
                    <TrackingStepSkeleton key={i} isLast={i === 4} />
                ))}
                <View style={{ height: 1, backgroundColor: '#E8EAED', marginHorizontal: 10, marginTop: 4 }} />
                <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                    <Skeleton width={120} height={13} borderRadius={4} />
                </View>
            </SkeletonCard>

            {/* Items Ordered card */}
            <SkeletonCard>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
                    <Skeleton width={140} height={14} borderRadius={4} />
                    <Skeleton width={72} height={28} borderRadius={20} />
                </View>
                <ItemRowSkeleton isLast={false} />
                <ItemRowSkeleton isLast={true} />
            </SkeletonCard>

            {/* Re Order button */}
            <Skeleton
                width="100%"
                height={50}
                borderRadius={10}
                style={{ marginHorizontal: 16, width: undefined, alignSelf: 'stretch' }}
            />

            {/* Total Bill card */}
            <SkeletonCard>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Skeleton width={40} height={40} borderRadius={6} />
                        <View style={{ gap: 6 }}>
                            <Skeleton width={80} height={14} borderRadius={4} />
                            <Skeleton width={60} height={11} borderRadius={4} />
                        </View>
                    </View>
                    <Skeleton width={56} height={16} borderRadius={4} />
                </View>
            </SkeletonCard>

            {/* Saving card */}
            <SkeletonCard style={{ overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Skeleton width={18} height={18} borderRadius={9} />
                        <Skeleton width={130} height={14} borderRadius={4} />
                    </View>
                    <Skeleton width={48} height={26} borderRadius={6} />
                </View>
                <View style={{ height: 1, backgroundColor: '#F0F1F3' }} />
                <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                        <Skeleton width={110} height={12} borderRadius={4} />
                        <Skeleton width={40} height={12} borderRadius={4} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                        <Skeleton width={90} height={12} borderRadius={4} />
                        <Skeleton width={40} height={12} borderRadius={4} />
                    </View>
                </View>
            </SkeletonCard>

            {/* Deliver To card */}
            <SkeletonCard style={{ padding: 16 }}>
                <Skeleton width={80} height={14} borderRadius={4} style={{ marginBottom: 12 }} />
                <Skeleton width={120} height={13} borderRadius={4} />
                <Skeleton width="85%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
                <Skeleton width="60%" height={12} borderRadius={4} style={{ marginTop: 5 }} />
                <Skeleton width={150} height={12} borderRadius={4} style={{ marginTop: 5 }} />
            </SkeletonCard>

            {/* Payment Method card */}
            <SkeletonCard style={{ padding: 16 }}>
                <Skeleton width={110} height={14} borderRadius={4} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Skeleton width={40} height={40} borderRadius={8} />
                    <View style={{ gap: 6 }}>
                        <Skeleton width={90} height={13} borderRadius={4} />
                        <Skeleton width={110} height={11} borderRadius={4} />
                    </View>
                </View>
            </SkeletonCard>

            {/* Prescription Details card */}
            <SkeletonCard style={{ padding: 16, marginBottom: 8 }}>
                <Skeleton width={140} height={14} borderRadius={4} style={{ marginBottom: 12 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Skeleton width={40} height={40} borderRadius={6} />
                        <View style={{ gap: 6 }}>
                            <Skeleton width={140} height={13} borderRadius={4} />
                            <Skeleton width={110} height={11} borderRadius={4} />
                        </View>
                    </View>
                    <Skeleton width={64} height={32} borderRadius={8} />
                </View>
            </SkeletonCard>
        </ScrollView>
    );
};
