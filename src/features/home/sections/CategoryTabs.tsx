import { Skeleton } from "@/src/components/ui/Skeleton";
import { useTabIndicator } from "@/src/features/home/hooks/useTabIndicator";
import type { CategoryTab } from "@/src/types/home";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, View } from "react-native";
import Animated from "react-native-reanimated";
import { TabItem } from "./TabItem";

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
      <View className="border-b border-[#919EAB33]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{
            paddingHorizontal: exactScale(16),
            // Matches the loaded state so the row doesn't jump when data lands.
            paddingTop: exactScale(4),
            paddingBottom: exactScale(12),
            gap: exactScale(32),
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} className="items-center gap-y-2">
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
    <View className="border-b border-[#919EAB33]">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(4),
          paddingBottom: 0,
        }}
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
            {
              height: exactScale(5),
              position: "absolute",
              bottom: 0,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              backgroundColor: "#107539", // Darker, brand-specific green from image
            },
            animatedIndicatorStyle,
          ]}
        />
      </ScrollView>
    </View>
  );
};
