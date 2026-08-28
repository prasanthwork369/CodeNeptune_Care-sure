import { Skeleton } from "@/src/components/ui/Skeleton";
import { icons } from "@/src/constants/icons";
import type { CategoryTab } from "@/src/features/home/types";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTabBarStore } from "@/src/store/useTabBarStore";
import { exactScale } from "@/src/utils/exactScale";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  INDICATOR_HEIGHT,
  styles as s,
} from "./CategoriesSidebar.styles";

interface CategoriesSidebarProps {
  tabs: CategoryTab[];
  activeTabId: string;
  onTabPress: (id: string) => void;
  width: number;
  safeAreaBottom: number;
  isLoading?: boolean;
}

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

  useEffect(() => {
    const layout = tabLayouts.current[activeTabId];
    if (!layout) return;
    const target = layout.y + layout.height / 2 - INDICATOR_HEIGHT / 2;
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
  }, [activeTabId, indicatorY]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: indicatorY.value }],
  }));

  const tabBarHeight = useTabBarStore((state) => state.tabBarHeight);

  if (isLoading) {
    return (
      <View style={[s.loadingRoot, { width }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: exactScale(10),
            paddingBottom: tabBarHeight + safeAreaBottom + exactScale(16),
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={s.skeletonItem}>
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
      style={[
        s.root,
        { width },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={s.scrollView}
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingBottom: tabBarHeight + safeAreaBottom + exactScale(16),
          },
        ]}
        onLayout={(e) => {
          viewportHeight.current = e.nativeEvent.layout.height;
        }}
      >
        <Animated.View
          style={[
            s.indicator,
            indicatorStyle,
          ]}
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
              style={[s.tabWrapper, { backgroundColor: wrapperBg }]}
              onLayout={(e) => {
                const { y, height } = e.nativeEvent.layout;
                tabLayouts.current[tab.id] = { y, height };
                if (tab.id === activeTabId && indicatorY.value < 0) {
                  indicatorY.value = y + height / 2 - INDICATOR_HEIGHT / 2;
                }
              }}
            >
              <Touchable
                onPress={() => onTabPress(tab.id)}
                activeOpacity={0.85}
                style={[
                  s.tabTouchable,
                  {
                    backgroundColor: itemBg,
                    borderBottomRightRadius,
                    borderTopRightRadius,
                  },
                ]}
              >
                {isActive ? (
                  <LinearGradient
                    colors={[
                      "rgba(196, 241, 86, 0.24)",
                      "rgba(80, 181, 59, 0.24)",
                    ]}
                    start={{ x: 0.0168, y: 0.5 }}
                    end={{ x: 0.9966, y: 0.5 }}
                    style={s.iconActiveGrad}
                  >
                    <icons.placeholder
                      width={exactScale(28)}
                      height={exactScale(28)}
                    />
                    {(tab.imageActive ?? tab.image) ? (
                      <Image
                        source={tab.imageActive ?? tab.image}
                        style={s.tabImage}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                      />
                    ) : null}
                  </LinearGradient>
                ) : (
                  <View style={s.iconInactiveBox}>
                    <icons.placeholder
                      width={exactScale(28)}
                      height={exactScale(28)}
                    />
                    {(tab.imageInactive ?? tab.image) ? (
                      <Image
                        source={tab.imageInactive ?? tab.image}
                        style={s.tabImage}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                      />
                    ) : null}
                  </View>
                )}
                <Text
                  style={[
                    s.labelText,
                    isActive ? s.labelTextActive : s.labelTextInactive,
                  ]}
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
CategoriesSidebar.displayName = "CategoriesSidebar";
