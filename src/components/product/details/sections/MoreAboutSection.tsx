import { useMoreAboutTabs } from "@/src/hooks/product/useMoreAboutTabs";
import { ApiAdditionalDataMap } from "@/src/types/productSection";
import React, { useEffect, useRef } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import { MoreAboutContent, MoreAboutHeading } from "./MoreAboutContent";
import { MoreAboutTabs } from "./MoreAboutTabs";

interface MoreAboutSectionProps {
  medicineName: string;
  additionalData?: ApiAdditionalDataMap | null;
}

const isTest = process.env.NODE_ENV === "test";

export const MoreAboutSection: React.FC<MoreAboutSectionProps> = ({
  medicineName,
  additionalData,
}) => {
  const {
    sections,
    activeSection,
    tabsScrollRef,
    indicatorX,
    indicatorWidth,
    handleTabPress,
    handleTabLayout,
  } = useMoreAboutTabs(additionalData);

  const cardsScrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;
  const isTabClickScroll = useRef(false);

  const onTabPressWithScroll = (tabId: string) => {
    isTabClickScroll.current = true;
    handleTabPress(tabId);
    setTimeout(() => {
      isTabClickScroll.current = false;
    }, 350);
  };

  useEffect(() => {
    if (activeSection) {
      const index = sections.findIndex((s) => s.id === activeSection.id);
      if (index >= 0) {
        cardsScrollRef.current?.scrollTo({
          x: index * screenWidth,
          animated: true,
        });
      }
    }
  }, [activeSection, sections, screenWidth]);

  if (!activeSection) return null;

  return (
    <View accessibilityLabel={`More About ${medicineName}`}>
      <MoreAboutHeading medicineName={medicineName} />
      <MoreAboutTabs
        sections={sections}
        activeSectionId={activeSection.id}
        tabsScrollRef={tabsScrollRef}
        indicatorX={indicatorX}
        indicatorWidth={indicatorWidth}
        onTabPress={onTabPressWithScroll}
        onTabLayout={handleTabLayout}
      />
      <ScrollView
        ref={cardsScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScroll={(e) => {
          if (isTabClickScroll.current) return;
          const index = Math.round(
            e.nativeEvent.contentOffset.x / screenWidth,
          );
          if (sections[index] && sections[index].id !== activeSection.id) {
            handleTabPress(sections[index].id);
          }
        }}
      >
        {sections.map((section) => {
          const shouldRender = !isTest || section.id === activeSection.id;
          return (
            <View key={section.id} style={{ width: screenWidth }}>
              {shouldRender ? <MoreAboutContent section={section} /> : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
