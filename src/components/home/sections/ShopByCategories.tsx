import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CategoryTabs } from './CategoryTabs';
import { CategoryCards } from './CategoryCards';
import type { CategoryTab, CategoryCard } from '@/src/types/home';

interface ShopByCategoriesProps {
    tabs: CategoryTab[];
    cards: CategoryCard[];
    onCardPress: (id: string) => void;
    isLoading?: boolean;
}

export const ShopByCategories: React.FC<ShopByCategoriesProps> = React.memo(({
    tabs,
    cards,
    onCardPress,
    isLoading
}) => {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        if (tabs.length > 0 && !activeId) {
            setActiveId(tabs[0].id);
        }
    }, [tabs]);

    const filteredCards = cards.filter(card => card.tabId === activeId);

    return (
        <View className="bg-white">
            <CategoryTabs
                tabs={tabs}
                activeId={activeId}
                onTabChange={setActiveId}
                isLoading={isLoading}
            />
            <Animated.View key={activeId} entering={FadeIn.duration(200)}>
                <CategoryCards
                    cards={filteredCards}
                    onCardPress={onCardPress}
                    isLoading={isLoading}
                />
            </Animated.View>
        </View>
    );
});
ShopByCategories.displayName = 'ShopByCategories';
