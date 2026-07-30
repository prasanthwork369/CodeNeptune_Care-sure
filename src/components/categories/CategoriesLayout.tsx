import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
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
  GRID_PADDING,
  GRID_GAP,
} from "./categories.styles";

const SIDEBAR_WIDTH = exactScale(86);

export const CategoriesLayout: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();
  const [activeTabId, setActiveTabId] = useState("");
  const adjustedBottom = useAdjustedBottomInset();

  // Dynamically calculate width so cards fill the entire remaining space exactly
  const availableGridWidth =
    windowWidth - SIDEBAR_WIDTH - GRID_PADDING * 2 - GRID_GAP;
  const cardWidth = availableGridWidth / 2;
  // Scale height proportionally to maintain the design aspect ratio
  const cardHeight = cardWidth * (CARD_HEIGHT / CARD_WIDTH);

  const { tabs, cards, isLoading } = useCategories();

  useEffect(() => {
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs]);

  const activeCards = cards.filter((card) => card.tabId === activeTabId);

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
          safeAreaBottom={adjustedBottom}
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
