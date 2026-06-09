import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Skeleton } from '../../ui/Skeleton';

const CardSkeleton = () => {
    const { width } = useWindowDimensions();
    const cardWidth = width * 0.42;
    const imageSize = cardWidth * 0.69;
    const cardHeight = imageSize * 1.5 + 160;

    return (
        <View
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ width: cardWidth, height: cardHeight, borderWidth: 0.77, borderColor: '#919EAB33' }}
        >
            {/* Image area */}
            <View style={{ height: imageSize * 1.5 }} className="items-center justify-center px-2 pb-2 pt-7">
                <Skeleton width={imageSize} height={imageSize} borderRadius={8} />
            </View>

            {/* Details area */}
            <View style={{ backgroundColor: '#F2FFF9' }} className="flex-1 px-3 pt-3">
                <Skeleton width="85%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="60%" height={12} style={{ marginBottom: 10 }} />
                <View className="flex-row items-center gap-x-2">
                    <Skeleton width={48} height={16} />
                    <Skeleton width={36} height={12} />
                </View>
            </View>

            {/* Add to cart button */}
            <View style={{ backgroundColor: '#F2FFF9' }} className="px-3 pb-3 pt-2">
                <Skeleton width="100%" height={36} borderRadius={10} />
            </View>
        </View>
    );
};

export const HomeProductCardSkeleton = ({ count = 4 }: { count?: number }) => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 40, gap: 14 }}
    >
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </ScrollView>
);
