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

    // Derived rather than set in an effect. Defaulting after the first commit
    // meant the first tab laid out inactive (medium), then switched to active
    // (semibold, wider) — reflowing the label inside a box measured for the
    // narrower font, so it wrapped mid-word and the indicator sat off-centre.
    // Falls back to the first tab whenever the selection isn't in the current
    // set, which also covers the tabs list changing underneath us.
    const activeId = tabs.some((t) => t.id === selectedId)
      ? selectedId
      : (tabs[0]?.id ?? "");

    const filteredCards = cards.filter((card) => card.tabId === activeId);

    return (
      <View className="bg-white">
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
