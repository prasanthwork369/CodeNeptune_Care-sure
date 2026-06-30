import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { useCategories } from '@/src/hooks/queries/useCategories';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { CategoriesSidebar, CategoriesGrid, CategoriesHeaderActions } from './sections';
import { CARD_HEIGHT, CARD_WIDTH, GRID_PADDING } from './categories.styles';

const SIDEBAR_WIDTH = 76;

export const CategoriesLayout: React.FC = () => {
    const [activeTabId, setActiveTabId] = useState('');
    const adjustedBottom = useAdjustedBottomInset();
    // Fixed to the Figma-designed card size on every device, per the app's
    // locked-to-Figma scaling policy -- on screens wider than the design
    // baseline this leaves empty space at the end of the row instead of
    // stretching the cards to fill it.
    const cardWidth = CARD_WIDTH;
    const cardHeight = CARD_HEIGHT;

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
