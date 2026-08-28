import { Skeleton } from "@/src/components/ui/Skeleton";
import { icons } from "@/src/constants/icons";
import type { CategoryTab } from "@/src/features/home/types";
import { components } from "@/src/constants/theme";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTabBarStore } from "@/src/store/useTabBarStore";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
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
  safeAreaBottom: number;
  isLoading?: boolean;
}

const INDICATOR_HEIGHT = 64;

// Android splits "Anti-Pollution" mid-word; a zero-width space lets it break after the hyphen.
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);
const breakableLabel = (l: string) => l.split("-").join("-" + ZERO_WIDTH_SPACE);

export const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  tabs,
  activeTabId,
  onTabPress,
  width,
  safeAreaBottom,
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
      const targetScrollY =
        layout.y - (viewportHeight.current - layout.height) / 2;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, targetScrollY),
          animated: true,
        });
      }, 50);
    }
  };

  useEffect(() => {
    moveIndicator(activeTabId);
  }, [activeTabId]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: indicatorY.value }],
  }));

  const tabBarHeight = useTabBarStore((s) => s.tabBarHeight);

  if (isLoading) {
    return (
      <View className="bg-[#F7F8FA] border-r border-[#919EAB33]" style={{ width }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: exactScale(10),
            paddingBottom: tabBarHeight + safeAreaBottom + exactScale(16),
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} className="items-center py-4 gap-y-2">
              <Skeleton width={40} height={40} borderRadius={12} />
              <Skeleton width={44} height={10} borderRadius={4} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={{ width, height: "100%", alignSelf: "stretch", backgroundColor: "#F2F4F7" }}
      className="z-10"
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: "#F2F4F7" }}
        contentContainerStyle={{
          backgroundColor: "#F2F2F7",
          flexGrow: 1,
          paddingBottom: tabBarHeight + safeAreaBottom + exactScale(16),
        }}
        onLayout={(e) => {
          viewportHeight.current = e.nativeEvent.layout.height;
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              top: 0,
              width: 4.5,
              height: INDICATOR_HEIGHT,
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
              zIndex: 20,
            },
            indicatorStyle,
          ]}
          className="bg-[#0F7635]"
        />

        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          const activeIndex = tabs.findIndex((t) => t.id === activeTabId);
          const isAboveActive = index === activeIndex - 1;
          const isBelowActive = index === activeIndex + 1;

          const wrapperBg = isActive || isAboveActive || isBelowActive ? "#FFFFFF" : "#F2F4F7";
          const itemBg = isActive ? "#FFFFFF" : "#F2F4F7";
          const borderBottomRightRadius = isAboveActive ? exactScale(24) : 0;
          const borderTopRightRadius = isBelowActive ? exactScale(24) : 0;

          return (
            <View
              key={tab.id}
              style={{ backgroundColor: wrapperBg, width: "100%" }}
              onLayout={(e) => {
                const { y, height } = e.nativeEvent.layout;
                tabLayouts.current[tab.id] = { y, height };
                if (tab.id === activeTabId) {
                  moveIndicator(tab.id);
                }
              }}
            >
              <Touchable
                onPress={() => onTabPress(tab.id)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: itemBg,
                  borderBottomRightRadius,
                  borderTopRightRadius,
                  alignItems: "center",
                  paddingVertical: exactScale(12),
                  paddingHorizontal: exactScale(4),
                }}
              >
              {isActive ? (
                <LinearGradient
                  colors={[
                    "rgba(196, 241, 86, 0.24)",
                    "rgba(80, 181, 59, 0.24)",
                  ]}
                  start={{ x: 0.0168, y: 0.5 }}
                  end={{ x: 0.9966, y: 0.5 }}
                  style={{
                    width: exactScale(48),
                    height: exactScale(48),
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 5,
                    position: "relative",
                  }}
                >
                  <icons.placeholder
                    width={exactScale(28)}
                    height={exactScale(28)}
                  />
                  {(tab.imageActive ?? tab.image) ? (
                    <Image
                      source={tab.imageActive ?? tab.image}
                      style={{
                        width: exactScale(40),
                        height: exactScale(40),
                        position: "absolute",
                      }}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                  ) : null}
                </LinearGradient>
              ) : (
                <View
                  style={{
                    width: exactScale(48),
                    height: exactScale(48),
                    borderRadius: 14,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 5,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    position: "relative",
                  }}
                >
                  <icons.placeholder
                    width={exactScale(28)}
                    height={exactScale(28)}
                  />
                  {(tab.imageInactive ?? tab.image) ? (
                    <Image
                      source={tab.imageInactive ?? tab.image}
                      style={{
                        width: exactScale(40),
                        height: exactScale(40),
                        position: "absolute",
                      }}
                      contentFit="contain"
                      cachePolicy="memory-disk"
                    />
                  ) : null}
                </View>
              )}
              <Text
                style={{
                  fontSize: moderateScale(10.5),
                  lineHeight: moderateScale(13),
                  color: isActive ? "#0F7635" : "#334155",
                }}
                className={`text-center px-0.5 ${isActive ? "font-inter-bold" : "font-inter-medium"}`}
                numberOfLines={2}
                allowFontScaling={false}
              >
                {breakableLabel(tab.label)}
              </Text>
            </Touchable>
          </View>
        );
      })}
      </ScrollView>
    </View>
  );
};
