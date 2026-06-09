import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/src/components/ui/Skeleton';

export const PatientSkeleton = () => {
    return (
        <View className="flex-1">
            {[1, 2, 3, 4].map((i) => (
                <View
                    key={i}
                    className="bg-white rounded-2xl mb-3 px-4 py-4 flex-row items-center"
                    style={{ borderWidth: 1, borderColor: '#F0F0F0' }}
                >
                    {/* Avatar */}
                    <Skeleton width={46} height={46} borderRadius={23} style={{ marginRight: 12 }} />

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
                        <View className="flex-row items-center mr-4">
                            <Skeleton width={14} height={14} style={{ marginRight: 4 }} />
                            <Skeleton width={30} height={12} />
                        </View>
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


