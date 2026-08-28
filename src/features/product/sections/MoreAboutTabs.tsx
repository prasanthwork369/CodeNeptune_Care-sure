import { Touchable } from "@/src/components/ui/Touchable";
import { ProductSection } from "@/src/features/product/types";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { styles as s } from "./product-sections.styles";

interface MoreAboutTabsProps {
  sections: ProductSection[];
  activeSectionId: string;
  tabsScrollRef: React.RefObject<ScrollView | null>;
  indicatorX: SharedValue<number>;
  indicatorWidth: SharedValue<number>;
  onTabPress: (tabId: string) => void;
  onTabLayout: (
    tabId: string,
    x: number,
    width: number,
    isActive: boolean,
  ) => void;
}

export const MoreAboutTabs: React.FC<MoreAboutTabsProps> = React.memo(
  ({
    sections,
    activeSectionId,
    tabsScrollRef,
    indicatorX,
    indicatorWidth,
    onTabPress,
    onTabLayout,
  }) => {
    const indicatorStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: indicatorX.value }],
      width: indicatorWidth.value,
    }));

    return (
      <View style={s.tabsContainer}>
        <ScrollView
          ref={tabsScrollRef}
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          scrollEnabled
          canCancelContentTouches={false}
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          style={s.tabsScrollView}
          contentContainerStyle={s.tabsScrollContent}
        >
          <View style={{ position: "relative" }}>
            <View style={{ flexDirection: "row" }}>
              {sections.map((section) => {
                const isActive = activeSectionId === section.id;
                return (
                  <Touchable
                    key={section.id}
                    onPress={() => onTabPress(section.id)}
                    throttleMs={0}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    activeOpacity={0.8}
                    style={s.tabTouchable}
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      onTabLayout(section.id, x, width, isActive);
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={isActive ? s.tabLabelActive : s.tabLabelInactive}
                    >
                      {section.label}
                    </Text>
                  </Touchable>
                );
              })}
            </View>

            <Animated.View
              pointerEvents="none"
              style={[
                s.tabIndicator,
                indicatorStyle,
              ]}
            />
          </View>
        </ScrollView>
      </View>
    );
  },
);

MoreAboutTabs.displayName = "MoreAboutTabs";
