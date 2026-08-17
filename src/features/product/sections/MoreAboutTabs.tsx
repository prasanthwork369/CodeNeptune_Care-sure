import { Touchable } from "@/src/components/ui/Touchable";
import { ProductSection } from "@/src/types/productSection";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

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
    <View
      className="mx-4 overflow-hidden rounded-t-[12px] bg-white"
      style={{ zIndex: 21 }}
    >
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
        style={{ backgroundColor: "#F4F7FC" }}
        contentContainerStyle={{
          paddingTop: exactScale(14),
        }}
      >
        <View style={{ position: "relative" }}>
          <View className="flex-row">
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
                  className="mr-6 pb-3"
                  onLayout={(event) => {
                    const { x, width } = event.nativeEvent.layout;
                    onTabLayout(section.id, x, width, isActive);
                  }}
                >
                  <Text
                    numberOfLines={1}
                    className={
                      isActive
                        ? "font-inter-medium text-brand-primary"
                        : "font-inter-medium text-brand-subtext"
                    }
                    style={{ fontSize: moderateScale(14) }}
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
              {
                position: "absolute",
                bottom: 0,
                height: exactScale(3),
                borderRadius: exactScale(2),
                backgroundColor: "#0F7635",
              },
              indicatorStyle,
            ]}
          />
        </View>
      </ScrollView>
    </View>
  );
});

MoreAboutTabs.displayName = "MoreAboutTabs";
