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

    if (isLoading) {
        return (
            <View className="flex-row flex-wrap px-2 mt-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={{ width: '33.33%', paddingHorizontal: 6, paddingVertical: 6 }}>
                        <Skeleton width="100%" height={undefined} style={{ aspectRatio: 114 / 128 }} borderRadius={10} />
                    </View>
                ))}
            </View>
        );
    }

    const remainder = cards.length % 3;
    const placeholders = remainder === 0 ? 0 : 3 - remainder;

    return (
        <View className="flex-row flex-wrap px-2 mt-5">
            {cards.map((card) => (
                <View key={card.id} style={{ width: '33.33%', paddingHorizontal: 6, paddingVertical: 6 }}>
                    <Touchable
                        activeOpacity={0.5}
                        onPress={() => onCardPress?.(card.id)}
                        accessibilityRole="button"
                        accessibilityLabel={card.label}
                        style={{ backgroundColor: card.bgColor, width: "100%", aspectRatio: 114 / 128, borderRadius: 10 }}
                        className="overflow-hidden justify-start"
                    >
                        <Text style={s.cardLabel} className="font-inter-semibold text-brand-text px-2 pt-2.5 leading-tight z-10">
                            {card.label}
                        </Text>
                        {card.image ? (
                            <Image
                                source={card.image}
                                style={{
                                    width: "67.5%",
                                    height: "68%",
                                    position: 'absolute',
                                    bottom: "-5%",
                                    right: "-5%",
                                    borderRadius: 8,
                                }}
                                contentFit="contain"
                            />
                        ) : (
                            <icons.placeholder
                                width="50%"
                                height="50%"
                                style={{
                                    position: 'absolute',
                                    bottom: "10%",
                                    right: "10%",
                                }}
                            />
                        )}
                    </Touchable>
                </View>
            ))}
        </View>
    );
};
