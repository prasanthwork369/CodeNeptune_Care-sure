import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { gridStyles as s, CARD_RADIUS, CARD_WIDTH, CARD_IMAGE_LEFT, CARD_IMAGE_WIDTH, CARD_IMAGE_HEIGHT } from '../categories.styles';
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
    padding: number;
    safeAreaBottom: number;
    isLoading?: boolean;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
    cards,
    cardWidth,
    cardHeight,
    padding,
    safeAreaBottom,
    isLoading,
}) => {
    const router = useNav();
    // cardImage's left/width/height in categories.styles.ts were authored
    // against the fixed CARD_WIDTH design value — since cardWidth is now
    // computed dynamically to fill the grid, scale those proportionally too
    // so the image keeps reaching the card's right/bottom edge as designed.
    const imageScale = cardWidth / CARD_WIDTH;
    const cardImageStyle = {
        ...s.cardImage,
        left: CARD_IMAGE_LEFT * imageScale,
        width: CARD_IMAGE_WIDTH * imageScale,
        height: CARD_IMAGE_HEIGHT * imageScale,
    };

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
                <View style={s.grid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            width={cardWidth}
                            height={cardHeight}
                            borderRadius={CARD_RADIUS}
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
            <View style={s.column}>
                {Array.from({ length: Math.ceil(Math.max(cards.length, 6) / 2) }).map((_, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={s.row}>
                        {[0, 1].map((col) => {
                            const index = rowIndex * 2 + col;
                            const card = cards[index];
                            if (!card) {
                                return (
                                    <View
                                        key={`empty-${index}`}
                                        style={{ width: cardWidth, height: cardHeight }}
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
                                    style={[s.card, { width: cardWidth, height: cardHeight, backgroundColor: card.bgColor }]}
                                >
                                    <Text style={s.cardLabel} className="font-inter-semibold text-brand-text p-3 z-10">
                                        {card.label}
                                    </Text>
                                    <Image
                                        source={card.image}
                                        style={cardImageStyle}
                                        contentFit="contain"
                                    />
                                </Touchable>
                            );
                        })}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};
