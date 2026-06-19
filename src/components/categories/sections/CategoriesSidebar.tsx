import { Skeleton } from "@/src/components/ui/Skeleton";
import type { CategoryTab } from "@/src/types/home";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { sidebarStyles as s } from '../categories.styles';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface CategoriesSidebarProps {
  tabs: CategoryTab[];
  activeTabId: string;
  onTabPress: (id: string) => void;
  width: number;
  isLoading?: boolean;
}

const INDICATOR_HEIGHT = 64;

export const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  tabs,
  activeTabId,
  onTabPress,
  width,
  isLoading,
}) => {
  const tabLayouts = useRef<Record<string, { y: number; height: number }>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  const viewportHeight = useRef(0);
  const indicatorY = useSharedValue(-INDICATOR_HEIGHT);

  const moveIndicator = (tabId: string) => {
    const layout = tabLayouts.current[tabId];
    if (!layout) return;
    const target = layout.y + layout.height / 2 - INDICATOR_HEIGHT / 2;
    // Snap on first placement, spring on subsequent changes
    if (indicatorY.value < 0) {
      indicatorY.value = target;
    } else {
      indicatorY.value = withTiming(target, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    }

    if (viewportHeight.current > 0) {
      const targetScrollY = layout.y - (viewportHeight.current - layout.height) / 2;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, targetScrollY), animated: true });
      }, 50);
    }
  };

  useEffect(() => {
    moveIndicator(activeTabId);
  }, [activeTabId]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: indicatorY.value }],
  }));

  if (isLoading) {
    return (
      <View
        className="bg-white border-r border-[#919EAB33]"
        style={{ width } as any}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} className="items-center py-5 gap-y-2">
              <Skeleton width={28} height={28} borderRadius={14} />
              <Skeleton width={44} height={10} borderRadius={4} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      className="bg-white border-r border-[#919EAB33] z-10"
      style={{ width, boxShadow: "4px 0px 20px 0px #0000000D" } as any}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10 }}
        onLayout={(e) => {
          viewportHeight.current = e.nativeEvent.layout.height;
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              right: 0,
              top: 0,
              width: 4.5,
              height: INDICATOR_HEIGHT,
            },
            indicatorStyle,
          ]}
          className="bg-[#0F7635] rounded-l-full"
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <Touchable
              key={tab.id}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.8}
              className="items-center py-5"
              onLayout={(e) => {
                const { y, height } = e.nativeEvent.layout;
                tabLayouts.current[tab.id] = { y, height };
                if (tab.id === activeTabId) {
                  moveIndicator(tab.id);
                }
              }}
            >
              <View style={s.iconWrap} className="items-center justify-center mb-1">
                <Image
                  source={isActive ? tab.imageActive : tab.imageInactive}
                  style={s.icon}
                  contentFit="contain"
                />
              </View>
              <Text
                style={s.label}
                className={`text-center px-1 text-brand-text ${isActive ? "font-inter-semibold" : "font-inter-medium"}`}
                numberOfLines={2}
              >
                {tab.label}
              </Text>
            </Touchable>
          );
        })}
      </ScrollView>
    </View>
  );
};
