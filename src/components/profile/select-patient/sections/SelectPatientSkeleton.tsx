import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '@/src/components/ui/Skeleton';

export const SelectPatientSkeleton = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 90 }}
            >
                {/* Prescription preview */}
                <View style={{ marginBottom: 16 }}>
                    <Skeleton width={90} height={14} style={{ marginBottom: 10 }} />
                    <View className="flex-row" style={{ gap: 10 }}>
                        <Skeleton width={72} height={72} borderRadius={10} />
                        <Skeleton width={72} height={72} borderRadius={10} />
                    </View>
                </View>

                {/* Patient chips */}
                <View className="flex-row" style={{ gap: 8, marginBottom: 16 }}>
                    <Skeleton width={100} height={36} borderRadius={6} />
                    <Skeleton width={120} height={36} borderRadius={6} />
                </View>

                {/* Contact info */}
                <Skeleton width={150} height={13} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={52} borderRadius={6} style={{ marginBottom: 16 }} />

                {/* Age / Gender */}
                <View className="flex-row" style={{ gap: 12, marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                        <Skeleton width={40} height={13} style={{ marginBottom: 8 }} />
                        <Skeleton width="100%" height={48} borderRadius={8} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Skeleton width={60} height={13} style={{ marginBottom: 8 }} />
                        <Skeleton width="100%" height={48} borderRadius={8} />
                    </View>
                </View>

                {/* Health problem */}
                <Skeleton width={180} height={13} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={48} borderRadius={6} style={{ marginBottom: 16 }} />

                {/* Symptoms */}
                <Skeleton width={200} height={13} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={100} borderRadius={6} />
            </ScrollView>

            {/* Footer */}
            <View
                className="bg-white px-4 pt-4"
                style={{ borderTopWidth: 1, borderTopColor: '#919EAB22', paddingBottom: insets.bottom + 16 }}
            >
                <View className="flex-row items-center pb-4">
                    <Skeleton width={22} height={22} borderRadius={11} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1, gap: 6 }}>
                        <Skeleton width="50%" height={14} />
                        <Skeleton width="80%" height={12} />
                    </View>
                </View>
                <View style={{ height: 1, backgroundColor: '#919EAB22' }} />
                <View className="flex-row items-center pt-4">
                    <View className="mr-4" style={{ gap: 6 }}>
                        <Skeleton width={40} height={11} />
                        <Skeleton width={60} height={18} />
                    </View>
                    <Skeleton width="100%" height={48} borderRadius={8} style={{ flex: 1, marginLeft: 20 }} />
                </View>
            </View>
        </View>
    );
};
