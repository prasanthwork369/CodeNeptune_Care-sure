import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { useCategories } from "@/src/features/categories/hooks/useCategories";
import React, { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";

import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import {
  CategoriesSidebar,
  CategoriesGrid,
  CategoriesHeaderActions,
} from "@/src/features/categories/sections";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
} from "@/src/features/categories/categories.styles";

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

  const { tabs, cards, isLoading, isFetching, error, refetch } =
    useCategories();
  const errorState = useQueryErrorState(error);

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

      {errorState && tabs.length === 0 ? (
        errorState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetch()}
            retrying={isFetching}
          />
        ) : (
          <RetryState onRetry={() => void refetch()} retrying={isFetching} />
        )
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
