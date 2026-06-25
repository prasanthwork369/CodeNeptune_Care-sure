import { HomeProductCard } from './HomeProductCard';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { Product } from '@/src/types/home';

interface ProductSectionProps {
    title: string;
    subtitle: string;
    headerColor: string;
    subtitleColor: string;
    badgeBgColor: string;
    badgeTextColor: string;
    detailsBgColor: string;
    bgColor?: string;
    bgGradient?: string[];
    bgLocations?: number[];
    headerImages: any[];
    products: Product[];
    onProductPress?: (id: string) => void;
    disableCart?: boolean;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
    title,
    subtitle,
    headerColor,
    subtitleColor,
    badgeBgColor,
    badgeTextColor,
    detailsBgColor,
    bgColor,
    bgGradient,
    bgLocations,
    headerImages,
    products,
    onProductPress,
    disableCart,
}) => {
    const { width } = useWindowDimensions();
    const cardWidth = width * 0.42;

    return (
        <View className="mb-6">
            {/* Top Dotted Line */}
            <View
                style={{ borderTopWidth: 1, borderTopColor: '#919EAB33', borderStyle: 'dashed' }}
                className="mx-5 mb-8"
            />

            {bgGradient ? (
                <LinearGradient
                    colors={bgGradient as any}
                    locations={bgLocations as any}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    className="absolute top-0 left-0 right-0 bottom-0"
                />
            ) : (
                <View style={{ backgroundColor: bgColor }} className="absolute top-0 left-0 right-0 bottom-0" />
            )}

            <View className="pb-8">
                {/* Header */}
                <View className="px-5 flex-row justify-between items-center mb-6">
                    <View className="flex-1 pr-2">
                        <Text className="text-[14px] font-inter-semibold text-brand-text">{title}</Text>
                        <View className="mt-0.5">
                            <Text style={{ color: subtitleColor }} className="text-[18px] font-inter-bold leading-[28px]">
                                {subtitle}
                            </Text>
                            <LinearGradient
                                colors={[subtitleColor, 'transparent'] as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ height: 3, width: 140, marginTop: 4, borderRadius: 2 }}
                                className="opacity-60"
                            />
                        </View>
                    </View>
                    <View className="flex-row items-center gap-x-1">
                        {headerImages.map((img, idx) => (
                            <Image key={idx} source={img as any} style={{ width: 55, height: 55 }} contentFit="contain" />
                        ))}
                    </View>
                </View>

                {/* Product Cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20, paddingRight: 40, gap: 14 }}
                >
                    {products.map((item) => (
                        <HomeProductCard
                            key={item.id}
                            item={item}
                            cardWidth={cardWidth}
                            badgeBgColor={badgeBgColor}
                            badgeTextColor={badgeTextColor}
                            detailsBgColor={detailsBgColor}
                            buttonColor={subtitleColor}
                            onPress={onProductPress}
                            disableCart={disableCart}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};
