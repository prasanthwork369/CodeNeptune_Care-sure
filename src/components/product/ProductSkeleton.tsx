import React from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { Skeleton } from '../ui/Skeleton';

export const ProductSkeleton = () => {
    const { width } = useWindowDimensions();
    const imgSize = width * 0.55;

    return (
        <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 100 }}
            className="flex-1"
        >
            {/* Image Carousel Mock */}
            <View className="mb-8 pt-4 items-center">
                <Skeleton width={imgSize} height={imgSize} borderRadius={16} />
                <View className="flex-row items-center justify-center mt-4 gap-x-1.5">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} width={i === 1 ? 18 : 8} height={5} borderRadius={3} />
                    ))}
                </View>
            </View>

            {/* Product Details Mock */}
            <View className="px-5">
                <Skeleton width={100} height={13} style={{ marginBottom: 8 }} />
                <Skeleton width="90%" height={24} style={{ marginBottom: 8 }} />
                <Skeleton width="60%" height={24} style={{ marginBottom: 16 }} />

                <View className="flex-row items-baseline gap-x-2 mb-4">
                    <Skeleton width={80} height={28} />
                    <Skeleton width={60} height={16} />
                    <Skeleton width={50} height={16} />
                </View>

                <Skeleton width="80%" height={12} style={{ marginBottom: 20 }} />
            </View>

            <View className="h-[1px] bg-[#F3F4F6] mt-4 mb-4" />

            {/* Variant Banner Mock */}
            <View className="bg-[#FAF5FF] py-4 px-5 mb-6">
                <Skeleton width="40%" height={14} />
            </View>

            {/* Logistics Bar Mock */}
            <View className="mx-5 mb-6 p-4 rounded-xl bg-white border border-[#F3F4F6]">
                <View className="flex-row items-center">
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <View className="ml-3 flex-1">
                        <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
                        <Skeleton width="40%" height={12} />
                    </View>
                </View>
            </View>

            {/* Trust Badge Mock */}
            <View className="flex-row px-5 mb-8 justify-between">
                {[1, 2, 3].map((i) => (
                    <View key={i} className="items-center">
                        <Skeleton width={48} height={48} borderRadius={24} style={{ marginBottom: 8 }} />
                        <Skeleton width={40} height={10} />
                    </View>
                ))}
            </View>

            {/* Know Your Medicine Mock */}
            <View className="px-5">
                <Skeleton width={150} height={18} style={{ marginBottom: 12 }} />
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} width="100%" height={12} style={{ marginBottom: 8 }} />
                ))}
            </View>
        </ScrollView>
    );
};
