import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { styles as s } from './CategoryCards.styles';
import { Touchable } from '@/src/components/ui/Touchable';
import { Image } from 'expo-image';
import { icons } from '@/src/constants/icons';
import type { CategoryCard } from '@/src/types/home';
import { Skeleton } from '@/src/components/ui/Skeleton';

interface CategoryCardsProps {
    cards: CategoryCard[];
    onCardPress?: (id: string) => void;
    isLoading?: boolean;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ cards, onCardPress, isLoading }) => {
    const { width } = useWindowDimensions();
    const cardWidth = (width - 48) / 3;
    const cardHeight = cardWidth * 1.12;
    const imgSize = cardWidth * 0.75;

    if (isLoading) {
        return (
            <View className="flex-row flex-wrap justify-between px-4 mt-5 gap-y-3.5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} width={cardWidth} height={cardHeight} borderRadius={8} style={{ marginBottom: 12 }} />
                ))}
            </View>
        );
    }

    const remainder = cards.length % 3;
    const placeholders = remainder === 0 ? 0 : 3 - remainder;

    return (
        <View className="flex-row flex-wrap justify-between px-4 mt-5 gap-y-3.5">
            {cards.map((card) => (
                <Touchable
                    key={card.id}
                    activeOpacity={0.5}
                    onPress={() => onCardPress?.(card.id)}
                    accessibilityRole="button"
                    accessibilityLabel={card.label}
                    style={{ backgroundColor: card.bgColor, width: cardWidth, height: cardHeight }}
                    className="rounded-lg overflow-hidden justify-start mb-3"
                >
                    <Text style={s.cardLabel} className="font-inter-semibold text-brand-text px-2 pt-2.5 leading-tight z-10">
                        {card.label}
                    </Text>
                    {card.image ? (
                        <Image
                            source={card.image}
                            style={{
                                width: imgSize,
                                height: imgSize * 0.9,
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                            }}
                            contentFit="contain"
                            contentPosition="bottom right"
                        />
                    ) : (
                        <icons.placeholder
                            width={imgSize * 0.65}
                            height={imgSize * 0.65}
                            style={{ position: 'absolute', bottom: 4, right: 4 }}
                        />
                    )}
                </Touchable>
            ))}
            {Array.from({ length: placeholders }).map((_, i) => (
                <View key={`pad-${i}`} style={{ width: cardWidth }} />
            ))}
        </View>
    );
};
