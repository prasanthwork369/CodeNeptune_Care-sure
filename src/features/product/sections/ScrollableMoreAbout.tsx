import { MoreAboutScrollNavigation } from "@/src/features/product/hooks/useMoreAboutScrollNavigation";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MoreAboutContent, MoreAboutHeading } from "./MoreAboutContent";
import { MoreAboutTabs } from "./MoreAboutTabs";

const Tabs: React.FC<{ navigation: MoreAboutScrollNavigation }> = ({
  navigation,
}) => {
  if (!navigation.activeSection) return null;
  return (
    <MoreAboutTabs
      sections={navigation.sections}
      activeSectionId={navigation.activeSection.id}
      tabsScrollRef={navigation.tabsScrollRef}
      indicatorX={navigation.indicatorX}
      indicatorWidth={navigation.indicatorWidth}
      onTabPress={navigation.handleTabPress}
      onTabLayout={navigation.handleTabLayout}
    />
  );
};

export const ScrollableMoreAboutContent: React.FC<{
  medicineName: string;
  navigation: MoreAboutScrollNavigation;
}> = ({ medicineName, navigation }) => {
  if (!navigation.sections.length) return null;
  return (
    <>
      <MoreAboutHeading medicineName={medicineName} />
      <View
        className="bg-[#F4F7FC]"
        collapsable={false}
        onLayout={(event) =>
          navigation.handleTabsLayout(
            event.nativeEvent.layout.y,
            event.nativeEvent.layout.height,
          )
        }
      >
        <Tabs navigation={navigation} />
      </View>
      {navigation.sections.map((section) => (
        <View
          key={section.id}
          onLayout={(event) =>
            navigation.handleSectionLayout(
              section.id,
              event.nativeEvent.layout.y,
              event.nativeEvent.layout.height,
            )
          }
        >
          <MoreAboutContent section={section} />
        </View>
      ))}
    </>
  );
};

export const StickyMoreAboutTabs: React.FC<{
  navigation: MoreAboutScrollNavigation;
}> = ({ navigation }) => {
  const visibility = useSharedValue(0);

  useEffect(() => {
    visibility.value = withTiming(navigation.isSticky ? 1 : 0, {
      duration: navigation.isSticky ? 120 : 80,
      easing: Easing.out(Easing.quad),
      reduceMotion: ReduceMotion.System,
    });
  }, [navigation.isSticky, visibility]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visibility.value,
  }));

  if (!navigation.activeSection) return null;

  return (
    <Animated.View
      pointerEvents={navigation.isSticky ? "auto" : "none"}
      className="absolute left-0 right-0 top-0 bg-[#F4F7FC]"
      style={[
        { zIndex: 20, elevation: 2, shadowColor: "transparent" },
        animatedStyle,
      ]}
    >
      <Tabs navigation={navigation} />
    </Animated.View>
  );
};
