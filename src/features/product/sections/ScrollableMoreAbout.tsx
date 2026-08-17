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

  // Track the previous sticky state so we can skip withTiming on show
  // (instant appearance eliminates the ~150ms gap between original tabs
  // leaving the screen and the sticky overlay becoming visible) while still
  // animating the hide for a natural feel when scrolling back upward.
  useEffect(() => {
    if (navigation.isSticky) {
      // Show: cancel any in-progress hide animation and snap to fully visible.
      // The original inline tabs have already scrolled off-screen by the time
      // isSticky becomes true, so an instant cut-in is not perceptible and
      // eliminates the visible gap that a fade-in would create.
      visibility.value = 1;
    } else {
      // Hide: short fade so the overlay doesn't flash off on upward scroll.
      visibility.value = withTiming(0, {
        duration: 60,
        easing: Easing.out(Easing.quad),
        reduceMotion: ReduceMotion.System,
      });
    }
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
