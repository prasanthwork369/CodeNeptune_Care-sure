import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { RetryState } from "@/src/components/ui/RetryState";
import { useCategories } from "@/src/hooks/queries/useCategories";
import React, { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";

import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import {
  CategoriesSidebar,
  CategoriesGrid,
  CategoriesHeaderActions,
} from "./sections";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
} from "./categories.styles";

const SIDEBAR_WIDTH = exactScale(80);
const GRID_PADDING = exactScale(12);
const GRID_GAP = exactScale(10);

export const CategoriesLayout: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();
  const [activeTabId, setActiveTabId] = useState("");
  const adjustedBottom = useAdjustedBottomInset();

  // 3-column grid calculation: image box (square) + text label below
  const availableGridWidth =
    windowWidth - SIDEBAR_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2;
  const cardWidth = Math.floor(availableGridWidth / 3);
  const cardHeight = cardWidth + exactScale(34);

  const { tabs, cards, isLoading, error, refetch } = useCategories();

  useEffect(() => {
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs]);

  const activeCards = cards.filter((card) => card.tabId === activeTabId);

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Categories"
        showBorder
        rightSlot={<CategoriesHeaderActions />}
      />

      {error && tabs.length === 0 ? (
        <RetryState onRetry={() => void refetch()} />
      ) : (
        <View className="flex-1 flex-row">
          <CategoriesSidebar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabPress={setActiveTabId}
            width={SIDEBAR_WIDTH}
            safeAreaBottom={adjustedBottom}
            isLoading={isLoading}
          />

          <CategoriesGrid
            key={activeTabId}
            cards={activeCards}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            padding={GRID_PADDING}
            safeAreaBottom={adjustedBottom}
            isLoading={isLoading}
          />
        </View>
      )}
    </View>
  );
};
