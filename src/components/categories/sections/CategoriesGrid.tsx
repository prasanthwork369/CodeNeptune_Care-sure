import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { gridStyles as s } from '../categories.styles';
import { Image } from 'expo-image';
import { Touchable } from '@/src/components/ui/Touchable';
import { useNav } from '@/src/hooks/useNav';
import type { CategoryCard } from '@/src/types/home';
import { components } from '@/src/constants/theme';
import { Skeleton } from '@/src/components/ui/Skeleton';

interface CategoriesGridProps {
    cards: CategoryCard[];
    cardWidth: number;
    cardHeight: number;
    gridGap: number;
    padding: number;
    safeAreaBottom: number;
    isLoading?: boolean;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
    cards,
    cardWidth,
    cardHeight,
    gridGap,
    padding,
    safeAreaBottom,
    isLoading,
}) => {
    const router = useNav();

    if (isLoading) {
        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    padding,
                    paddingBottom: components.tabBar.height + safeAreaBottom + 40,
                }}
            >
                <View className="flex-row flex-wrap justify-between">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            width={cardWidth}
                            height={cardHeight}
                            borderRadius={16}
                            style={{ marginBottom: gridGap }}
                        />
                    ))}
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1"
            contentContainerStyle={{
                padding: padding,
                paddingBottom: components.tabBar.height + safeAreaBottom + 40,
            }}
        >
            <View className="flex-row flex-wrap justify-between">
                {Array.from({ length: Math.max(cards.length, 6) }).map((_, index) => {
                    const card = cards[index];
                    if (!card) {
                        return (
                            <View
                                key={`empty-${index}`}
                                style={{ width: cardWidth, height: cardHeight, marginBottom: gridGap }}
                            />
                        );
                    }
                    return (
                        <Touchable
                            key={card.id}
                            activeOpacity={0.8}
                            onPress={() => router.push({
                                pathname: '/category/[id]',
                                params: { id: card.id, slug: card.slug, familySlug: card.familySlug, name: card.label.replace('\n', ' ') },
                            })}
                            style={{ width: cardWidth, height: cardHeight, backgroundColor: card.bgColor, marginBottom: gridGap }}
                            className="rounded-[16px] overflow-hidden relative"
                        >
                            <Text style={s.cardLabel} className="font-inter-semibold text-brand-text p-3 leading-tight z-10">
                                {card.label}
                            </Text>
                            <Image
                                source={card.image}
                                style={{ width: cardWidth * 0.75, height: cardHeight * 0.7, position: 'absolute', bottom: 0, right: 0 }}
                                contentFit="contain"
                            />
                        </Touchable>
                    );
                })}
            </View>
        </ScrollView>
    );
};
