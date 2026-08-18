import React, { useEffect } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { Image } from "expo-image";
import { styles as s } from "./TabItem.styles";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { CategoryTab } from "@/src/features/home/types";
import { springs } from "@/src/theme";

interface TabItemProps {
  tab: CategoryTab;
  isActive: boolean;
  onPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
}

export const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onPress,
  onLayout,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.05 : 1, springs.tab);
  }, [isActive, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconSource = isActive
    ? (tab.imageActive ?? tab.image)
    : (tab.imageInactive ?? tab.image);

  return (
    <Touchable
      onPress={onPress}
      onLayout={onLayout}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isActive }}
      className="items-center justify-end mx-4 pb-3 px-1"
    >
      <Animated.View
        style={[
          animatedStyle,
          { alignItems: "center", justifyContent: "flex-end" },
        ]}
      >
        {/* Skipped entirely when there is no icon, so no blank box is reserved. */}
        {iconSource || tab.emoji ? (
          <View style={s.iconWrap}>
            {iconSource ? (
              <Image source={iconSource} style={s.icon} contentFit="contain" />
            ) : (
              <Text style={s.emoji}>{tab.emoji}</Text>
            )}
          </View>
        ) : null}
        {/* Active swaps to wider semibold; wrapping would hide the growth. */}
        <Text
          numberOfLines={1}
          style={s.label}
          className={`text-brand-text ${isActive ? "font-inter-semibold" : "font-inter-medium"}`}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </Touchable>
  );
};
