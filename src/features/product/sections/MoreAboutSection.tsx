import { useMoreAboutTabs } from "@/src/features/product/hooks/useMoreAboutTabs";
import { ApiAdditionalDataMap } from "@/src/features/product/types";
import React from "react";
import { View } from "react-native";
import { MoreAboutContent, MoreAboutHeading } from "./MoreAboutContent";
import { MoreAboutTabs } from "./MoreAboutTabs";

interface MoreAboutSectionProps {
  medicineName: string;
  additionalData?: ApiAdditionalDataMap | null;
}

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
        onTabPress={handleTabPress}
        onTabLayout={handleTabLayout}
      />
      {sections.map((section) => (
        <MoreAboutContent key={section.id} section={section} />
      ))}
    </View>
  );
};
