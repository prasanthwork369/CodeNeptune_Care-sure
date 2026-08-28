import React, { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { CategoryTabs } from "./CategoryTabs";
import { CategoryCards } from "./CategoryCards";
import type { CategoryTab, CategoryCard } from "@/src/features/home/types";

interface ShopByCategoriesProps {
  tabs: CategoryTab[];
  cards: CategoryCard[];
  onCardPress: (card: CategoryCard) => void;
  isLoading?: boolean;
}

export const ShopByCategories: React.FC<ShopByCategoriesProps> = React.memo(
  ({ tabs, cards, onCardPress, isLoading }) => {
    const [selectedId, setSelectedId] = useState("");

    // Derived rather than set in an effect.
    const activeId = tabs.some((t) => t.id === selectedId)
      ? selectedId
      : (tabs[0]?.id ?? "");

    const filteredCards = cards.filter((card) => card.tabId === activeId);

    return (
      <View style={{ backgroundColor: "#FFFFFF" }}>
        <CategoryTabs
          tabs={tabs}
          activeId={activeId}
          onTabChange={setSelectedId}
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
  },
);
ShopByCategories.displayName = "ShopByCategories";
