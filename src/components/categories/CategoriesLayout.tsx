import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { useCategories } from '@/src/hooks/queries/useCategories';
import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoriesSidebar, CategoriesGrid, CategoriesHeaderActions } from './sections';

const SIDEBAR_WIDTH = 76;
const GRID_PADDING = 16;
const GRID_GAP = 12;

export const CategoriesLayout: React.FC = () => {
    const [activeTabId, setActiveTabId] = useState('');
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const { tabs, cards, isLoading } = useCategories();

    useEffect(() => {
        if (tabs.length > 0 && !activeTabId) {
            setActiveTabId(tabs[0].id);
        }
    }, [tabs]);

    const activeCards = cards.filter(card => card.tabId === activeTabId);
    const contentWidth = width - SIDEBAR_WIDTH - GRID_PADDING * 2;
    const cardWidth = (contentWidth - GRID_GAP) / 2;
    const cardHeight = cardWidth;

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
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    gridGap={GRID_GAP}
                    padding={GRID_PADDING}
                    safeAreaBottom={insets.bottom}
                    isLoading={isLoading}
                />
            </View>
        </View>
    );
};
