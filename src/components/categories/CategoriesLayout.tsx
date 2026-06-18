import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { useCategories } from '@/src/hooks/queries/useCategories';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoriesSidebar, CategoriesGrid, CategoriesHeaderActions } from './sections';
import { CARD_HEIGHT, CARD_WIDTH, GRID_PADDING } from './categories.styles';

const SIDEBAR_WIDTH = 76;

export const CategoriesLayout: React.FC = () => {
    const [activeTabId, setActiveTabId] = useState('');
    const insets = useSafeAreaInsets();

    const { tabs, cards, isLoading } = useCategories();

    useEffect(() => {
        if (tabs.length > 0 && !activeTabId) {
            setActiveTabId(tabs[0].id);
        }
    }, [tabs]);

    const activeCards = cards.filter(card => card.tabId === activeTabId);

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <ScreenHeader
                title="Categories"
                showBorder
                rightSlot={<CategoriesHeaderActions />}
            />

            <View className="flex-1 flex-row">
                <CategoriesSidebar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabPress={setActiveTabId}
                    width={SIDEBAR_WIDTH}
                    isLoading={isLoading}
                />

                <CategoriesGrid
                    cards={activeCards}
                    cardWidth={CARD_WIDTH}
                    cardHeight={CARD_HEIGHT}
                    padding={GRID_PADDING}
                    safeAreaBottom={insets.bottom}
                    isLoading={isLoading}
                />
            </View>
        </View>
    );
};
