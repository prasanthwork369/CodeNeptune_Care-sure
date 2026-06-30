import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { useCategories } from '@/src/hooks/queries/useCategories';
import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { CategoriesSidebar, CategoriesGrid, CategoriesHeaderActions } from './sections';
import { CARD_HEIGHT, CARD_WIDTH, GRID_GAP, GRID_PADDING } from './categories.styles';

const SIDEBAR_WIDTH = 76;
const CARD_ASPECT_RATIO = CARD_HEIGHT / CARD_WIDTH;

export const CategoriesLayout: React.FC = () => {
    const [activeTabId, setActiveTabId] = useState('');
    const adjustedBottom = useAdjustedBottomInset();
    const { width: screenWidth } = useWindowDimensions();
    // Fills the grid's actual available width (screen - sidebar - padding -
    // gap) instead of a fixed CARD_WIDTH, which left unused space on the
    // right since it didn't match the real container width. Height stays
    // proportional to the original design ratio instead of a fixed value.
    const cardWidth = (screenWidth - SIDEBAR_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;
    const cardHeight = cardWidth * CARD_ASPECT_RATIO;

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
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    padding={GRID_PADDING}
                    safeAreaBottom={adjustedBottom}
                    isLoading={isLoading}
                />
            </View>
        </View>
    );
};
