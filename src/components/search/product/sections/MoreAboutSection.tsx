import { ApiMobileAdditionalData } from "@/src/api/medicine.api";
import { buildMoreAboutData } from "@/src/components/product/details/sections/useMoreAboutData";
import { HtmlContent } from "@/src/components/ui/HtmlContent";
import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";
import Animated, {
    Easing,
    LinearTransition,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface MoreAboutSectionProps {
  medicineName: string;
  mobileAdditionalData?: ApiMobileAdditionalData | null;
}

export const MoreAboutSection: React.FC<MoreAboutSectionProps> = ({
  medicineName,
  mobileAdditionalData,
}) => {
  const { tabsList, safetyAdviceList } =
    buildMoreAboutData(mobileAdditionalData);

  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const activeTab = selectedTabId || tabsList[0]?.id;
  const activeTabData = tabsList.find((t) => t.id === activeTab) || tabsList[0];
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [contentMinHeight, setContentMinHeight] = useState(160);

  useEffect(() => {
    setContentMinHeight(160);
  }, [medicineName]);

  const handleContentLayout = (e: any) => {
    const height = e.nativeEvent.layout.height;
    if (height > contentMinHeight) setContentMinHeight(height);
  };

  const cardsScrollRef = useRef<ScrollView>(null);
  const tabsScrollRef = useRef<ScrollView>(null);
  const cardXOffsets = useRef<Record<string, number>>({});
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
      { duration: 120, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished) runOnJS(setSelectedTabId)(tabId);
      },
    );
  };

  // Fades back in only after React has actually re-rendered with the new
  // tab's content (this effect runs post-commit) — starting the fade-in
  // from inside the reanimated callback above would race ahead of the
  // re-render, since runOnJS doesn't wait for it, making the new content
  // visibly pop in partway through the animation instead of crossfading.
  useEffect(() => {
    contentOpacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
  }, [selectedTabId]);

  const toggleExpand = (id: string) => {
    const isExpanding = expandedCardId !== id;
    setExpandedCardId((prev) => (prev === id ? null : id));
    if (isExpanding && cardXOffsets.current[id] !== undefined) {
      setTimeout(() => {
        const screenWidth = Dimensions.get("window").width;
        const expandedWidth = 280;
        const centeredX = Math.max(
          0,
          cardXOffsets.current[id] - (screenWidth - expandedWidth) / 2,
        );
        cardsScrollRef.current?.scrollTo({ x: centeredX, animated: true });
      }, 80);
    }
  };

  return (
    <View className="mx-4 mb-6 mt-6">
      <Text className="bg-white py-1 pb-4 font-inter-bold text-brand-text mb-4" style={{ fontSize: moderateScale(17) }}>
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
          style={{ backgroundColor: "#F4F7FC" }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          bounces={false}
          overScrollMode="never"
        >
          <View style={{ position: "relative" }}>
            <View style={{ flexDirection: "row" }}>
              {tabsList.map((tab) => (
                <Touchable
                  key={tab.id}
                  activeOpacity={0.8}
                  onPress={() => handleTabPress(tab.id)}
                  className="mr-6 pb-3"
                  onLayout={(e) => {
                    const { x, width } = e.nativeEvent.layout;
                    tabLayouts.current[tab.id] = { x, width };
                    if (tab.id === activeTab && indicatorWidth.value === 0) {
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
                    className={`font-inter-medium ${activeTab === tab.id ? "text-brand-primary" : "text-brand-subtext"}`}
                    style={{ fontSize: moderateScale(14) }}
                  >
                    {tab.label}
                  </Text>
                </Touchable>
              ))}
            </View>

            <Animated.View
              style={[
                {
                  position: "absolute",
                  bottom: 0,
                  height: 3.2,
                  borderRadius: 2,
                  backgroundColor: "#0F7635",
                },
                indicatorStyle,
              ]}
            />
          </View>
        </ScrollView>

        <Animated.View
          className="px-2 pt-4 pb-5"
          style={[contentAnimStyle, { minHeight: contentMinHeight }]}
          onLayout={handleContentLayout}
          layout={LinearTransition.duration(220).easing(Easing.out(Easing.quad))}
        >
          {activeTabData?.heading ? (
            <Text className="font-inter-medium text-brand-text mb-2" style={{ fontSize: moderateScale(16) }}>
              {activeTabData.heading}
            </Text>
          ) : null}

          {activeTabData?.content ? (
            <HtmlContent content={activeTabData.content} />
          ) : null}

          {activeTab === "how_it_works" && (
            <ScrollView
              ref={cardsScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4 pb-2"
              contentContainerStyle={{ paddingRight: 16 }}
              bounces={false}
              overScrollMode="never"
            >
              <View className="flex-row items-stretch">
                {safetyAdviceList.map((item) => {
                  const isExpanded = expandedCardId === item.id;
                  return (
                    <Animated.View
                      key={item.id}
                      layout={LinearTransition.duration(250).easing(
                        Easing.out(Easing.quad),
                      )}
                      className="border border-[#919EAB33] rounded-[12px] p-3 mr-3 bg-white"
                      style={{ width: isExpanded ? 280 : 175 }}
                      onLayout={(e) => {
                        cardXOffsets.current[item.id] = e.nativeEvent.layout.x;
                      }}
                    >
                      <View className="w-14 h-14 rounded-[8px] bg-[#F1EDFD] items-center justify-center mb-3">
                        {item.image ? (
                          <RemoteIcon uri={item.image} size={48} />
                        ) : null}
                      </View>
                      <Text className="font-inter-semibold text-brand-text mb-2" style={{ fontSize: moderateScale(14) }}>
                        {item.title}
                      </Text>
                      <View
                        className="self-start px-2 py-1 rounded-[4px] mb-2"
                        style={{ backgroundColor: item.statusBg }}
                      >
                        <Text
                          className="font-inter-semibold"
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          style={{ color: item.statusColor, fontSize: moderateScale(10) }}
                        >
                          {item.status}
                        </Text>
                      </View>
                      <Text className="font-inter-medium text-brand-subtext leading-[18px]" style={{ fontSize: moderateScale(12) }}>
                        {isExpanded
                          ? item.fullDescription
                          : item.shortDescription}
                        {item.expandable && (
                          <Text
                            onPress={() => toggleExpand(item.id)}
                            className="text-[#0F7635] font-inter-bold text-sm"
                          >
                            {isExpanded ? " Show less" : " Read More"}
                          </Text>
                        )}
                      </Text>
                    </Animated.View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
};
