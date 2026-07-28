import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/src/components/ui/Skeleton';

export const AddressSkeleton = () => {
    return (
        <View className="flex-1">
            <Skeleton width={150} height={18} style={{ marginBottom: 12 }} />
            
            {[1, 2, 3].map((i) => (
                <View 
                    key={i} 
                    className="bg-white mb-3 overflow-hidden"
                    style={{ borderWidth: 1, borderColor: '#DFE3E8', borderRadius: 12 }}
                >
                    {/* Label row */}
                    <View
                        className="flex-row items-center gap-x-3"
                        style={{ paddingHorizontal: 14, paddingTop: 18, paddingBottom: 10 }}
                    >
                        <Skeleton width={18} height={18} borderRadius={9} />
                        <Skeleton width={80} height={14} />
                    </View>

                    {/* Address */}
                    <View style={{ paddingHorizontal: 10, paddingBottom: 14 }}>
                        <Skeleton width="90%" height={12} style={{ marginBottom: 6 }} />
                        <Skeleton width="70%" height={12} />
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: '#E1E5E8', marginHorizontal: 10 }} />

                    {/* Actions */}
                    <View className="flex-row items-center justify-between px-3 py-3">
                        <View className="flex-row items-center gap-x-1.5">
                            <Skeleton width={15} height={15} />
                            <Skeleton width={40} height={12} />
                        </View>
                        <View className="flex-row items-center gap-x-1.5">
                            <Skeleton width={15} height={15} />
                            <Skeleton width={50} height={12} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
};
