import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { useCategories } from "@/src/features/categories/hooks/useCategories";
import React, { useState } from "react";
import { View, useWindowDimensions } from "react-native";

import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import {
  CategoriesSidebar,
  CategoriesGrid,
  CategoriesHeaderActions,
} from "@/src/features/categories/sections";

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
  const liveState = useLiveScreenState({
    error,
    hasData: tabs.length > 0,
    loading: isLoading,
  });

  const effectiveTabId = activeTabId || tabs[0]?.id || "";
  const activeCards = cards.filter((card) => card.tabId === effectiveTabId);

  return (
    <View className="flex-1 bg-white">
      {liveState ? (
        liveState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetch()}
            retrying={isFetching}
          />
        ) : (
          <RetryState onRetry={() => void refetch()} retrying={isFetching} />
        )
      ) : (
        <>
          <ScreenHeader
            title="Categories"
            showBorder
            rightSlot={<CategoriesHeaderActions />}
          />
          <View className="flex-1 flex-row">
            <CategoriesSidebar
              tabs={tabs}
              activeTabId={effectiveTabId}
              onTabPress={setActiveTabId}
              width={SIDEBAR_WIDTH}
              safeAreaBottom={adjustedBottom}
              isLoading={isLoading}
            />

            <CategoriesGrid
              key={effectiveTabId}
              cards={activeCards}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              padding={GRID_PADDING}
              safeAreaBottom={adjustedBottom}
              isLoading={isLoading}
            />
          </View>
        </>
      )}
    </View>
  );
};
