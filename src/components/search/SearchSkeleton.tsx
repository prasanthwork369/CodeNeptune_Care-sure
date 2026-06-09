import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '../ui/Skeleton';

export const SearchSkeleton = () => {
    return (
        <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 100 }}
            className="flex-1"
        >
            {/* Mocking ColumnHeaders */}
            <View className="flex-row mx-4 mt-2 mb-4">
                <View className="flex-1 items-center">
                    <Skeleton width={80} height={12} />
                </View>
                <View className="flex-1 items-center">
                    <Skeleton width={100} height={12} />
                </View>
            </View>

            {[1, 2, 3, 4].map((i) => (
                <View key={i} className="px-4 mb-5">
                    <View 
                        style={{ borderWidth: 1, borderColor: '#919EAB33' }}
                        className="w-full rounded-[12px] bg-white overflow-hidden"
                    >
                        {/* Top Section */}
                        <View className="flex-row w-full">
                            {/* Left Side */}
                            <View className="flex-1 p-4">
                                <View className="mb-6">
                                    <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
                                    <Skeleton width="60%" height={12} />
                                </View>
                                <View className="mt-auto">
                                    <Skeleton width={60} height={22} style={{ marginBottom: 6 }} />
                                    <Skeleton width={50} height={12} />
                                </View>
                            </View>

                            {/* Right Side */}
                            <View className="flex-1 p-4 bg-[#FFFDEB]">
                                <View className="mb-6">
                                    <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
                                    <Skeleton width="60%" height={12} />
                                </View>
                                <View className="mt-auto">
                                    <View className="flex-row items-baseline gap-x-2 mb-1.5">
                                        <Skeleton width={60} height={22} />
                                        <Skeleton width={40} height={14} />
                                    </View>
                                    <Skeleton width={80} height={12} style={{ marginTop: 4 }} />
                                </View>
                            </View>
                        </View>

                        {/* Divider */}
                        <View className="h-[1px] w-full bg-[#EAEAEA]" />

                        {/* Bottom Row */}
                        <View className="flex-row justify-between items-center px-4 py-3.5 bg-white">
                            <View className="flex-row items-center">
                                <Skeleton width={18} height={18} borderRadius={9} />
                                <Skeleton width={120} height={12} style={{ marginLeft: 8 }} />
                            </View>
                            <Skeleton width={70} height={34} borderRadius={8} />
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};
