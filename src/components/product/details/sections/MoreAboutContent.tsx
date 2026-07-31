import { ProductSection } from "@/src/types/productSection";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { ProductSectionView } from "./moreinfo/ProductSectionView";

interface MoreAboutContentProps {
  section: ProductSection;
}

export const MoreAboutContent: React.FC<MoreAboutContentProps> = ({
  section,
}) => (
  <View className="mx-4 mb-6 overflow-hidden rounded-b-[12px] bg-white">
    <View className="px-2 pb-5 pt-4" style={{ height: exactScale(300) }}>
      <Text
        className="mb-3 px-2 font-inter-bold text-brand-text"
        style={{
          fontSize: moderateScale(15),
          lineHeight: moderateScale(20),
        }}
      >
        {section.title}
      </Text>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={true}
        bounces={false}
        style={{ flex: 1 }}
      >
        <ProductSectionView section={section} contained={false} />
      </ScrollView>
    </View>
  </View>
);

export const MoreAboutHeading: React.FC<{ medicineName: string }> = ({
  medicineName,
}) => (
  <Text
    className="mx-4 mb-4 mt-6 font-inter-bold text-brand-text"
    style={{ fontSize: moderateScale(17) }}
    accessibilityRole="header"
  >
    More About {medicineName}
  </Text>
);
