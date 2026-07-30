import { Touchable } from "@/src/components/ui/Touchable";
import { ApiAdditionalDataMap } from "@/src/types/productSection";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { parseProductSections } from "@/src/utils/productSections";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ProductSectionView } from "./moreinfo/ProductSectionView";

interface MoreAboutSectionProps {
  medicineName: string;
  additionalData?: ApiAdditionalDataMap | null;
}

/**
 * Dynamic content-switching tabs backed by additionalData.
 * Tab and content animation behavior mirrors the original CareSure component.
 */
export const MoreAboutSection: React.FC<MoreAboutSectionProps> = ({
  medicineName,
  additionalData,
}) => {
  const sections = useMemo(
    () => parseProductSections(additionalData),
    [additionalData],
  );
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const activeTabId = selectedTabId ?? sections[0]?.id ?? null;
  const activeSection =
    sections.find((section) => section.id === activeTabId) ?? sections[0];
  const [contentMinHeight, setContentMinHeight] = useState(160);

  const tabsScrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  useEffect(() => {
    setContentMinHeight(160);
  }, [medicineName]);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setContentMinHeight((current) => Math.max(current, height));
  };

  const handleTabPress = (tabId: string) => {
    const layout = tabLayouts.current[tabId];
    if (layout) {
      indicatorX.value = withTiming(layout.x, {
        duration: 280,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });
      indicatorWidth.value = withTiming(layout.width, {
        duration: 280,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      });

      const screenWidth = Dimensions.get("window").width;
      setTimeout(() => {
        tabsScrollRef.current?.scrollTo({
          x: Math.max(0, layout.x - (screenWidth - layout.width) / 2),
          animated: true,
        });
      }, 50);
    }

    contentOpacity.value = withTiming(
      0,
      {
        duration: 120,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        if (!finished) return;

        runOnJS(setSelectedTabId)(tabId);
        contentOpacity.value = withTiming(1, {
          duration: 220,
          easing: Easing.out(Easing.quad),
        });
      },
    );
  };

  if (!activeSection) return null;

  return (
    <View
      className="mx-4 mb-6 mt-2"
      accessibilityLabel={`More About ${medicineName}`}
    >
      <Text
        className="mb-4 font-inter-bold text-brand-text"
        style={{ fontSize: moderateScale(17) }}
      >
        More About {medicineName}
      </Text>

      <Animated.View
        className="rounded-[12px] bg-white"
        layout={LinearTransition.duration(260).easing(Easing.out(Easing.quad))}
      >
        <ScrollView
          ref={tabsScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          style={{ backgroundColor: "#F4F7FC" }}
          contentContainerStyle={{
            paddingHorizontal: exactScale(16),
            paddingTop: exactScale(14),
          }}
        >
          <View style={{ position: "relative" }}>
            <View className="flex-row">
              {sections.map((section) => {
                const isActive = activeSection.id === section.id;
                return (
                  <Touchable
                    key={section.id}
                    onPress={() => handleTabPress(section.id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    activeOpacity={0.8}
                    className="mr-6 pb-3"
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      tabLayouts.current[section.id] = { x, width };

                      if (isActive && indicatorWidth.value === 0) {
                        indicatorX.value = x;
                        indicatorWidth.value = width;

                        const screenWidth = Dimensions.get("window").width;
                        setTimeout(() => {
                          tabsScrollRef.current?.scrollTo({
                            x: Math.max(0, x - (screenWidth - width) / 2),
                            animated: true,
                          });
                        }, 100);
                      }
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
                      {section.title}
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

        <Animated.View
          className="px-2 pb-5 pt-4"
          style={[contentAnimStyle, { minHeight: contentMinHeight }]}
          onLayout={handleContentLayout}
        >
          <ProductSectionView section={activeSection} contained={false} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};
