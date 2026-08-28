import { Skeleton } from "@/src/components/ui/Skeleton";
import { useTabIndicator } from "@/src/features/home/hooks/useTabIndicator";
import type { CategoryTab } from "@/src/features/home/types";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";
import { TabItem } from "./TabItem";
import { styles as s } from "./CategoryTabs.styles";

interface CategoryTabsProps {
  tabs: CategoryTab[];
  activeId: string;
  onTabChange: (id: string) => void;
  isLoading?: boolean;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  tabs,
  activeId,
  onTabChange,
  isLoading,
}) => {
  const { scrollViewRef, onTabLayout, animatedIndicatorStyle } =
    useTabIndicator(activeId);

  if (isLoading) {
    return (
      <View style={s.root}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={s.skeletonScroll}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={s.skeletonItem}>
              <Skeleton
                width={exactScale(40)}
                height={exactScale(40)}
                borderRadius={exactScale(20)}
              />
              <Skeleton
                width={exactScale(48)}
                height={exactScale(10)}
                borderRadius={exactScale(4)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeId}
            onPress={() => onTabChange(tab.id)}
            onLayout={(e) => onTabLayout(tab.id, e)}
          />
        ))}

        <Animated.View
          style={[
            s.activeIndicator,
            animatedIndicatorStyle,
          ]}
        />
      </ScrollView>
    </View>
  );
};
