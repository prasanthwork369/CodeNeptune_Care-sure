import { Touchable } from "@/src/components/ui/Touchable";
import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";
import { ProductSection } from "@/src/features/product/types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { htmlToPlainText } from "@/src/utils/productSections";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { ProductSectionView } from "./moreinfo/ProductSectionView";

const DESCRIPTION_PREVIEW_HEIGHT = exactScale(220);
const DESCRIPTION_PREVIEW_CHARACTERS = 360;

interface MoreAboutContentProps {
  section: ProductSection;
}

export const MoreAboutContent: React.FC<MoreAboutContentProps> = ({
  section,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const isDescription = section.designType === SECTION_DESIGN_TYPE.TEXT_BLOCK;
  const descriptionCharacters = isDescription
    ? htmlToPlainText(section.html).length
    : 0;
  const isLongDescription =
    isDescription &&
    (descriptionHeight > DESCRIPTION_PREVIEW_HEIGHT + 1 ||
      descriptionCharacters > DESCRIPTION_PREVIEW_CHARACTERS);

  return (
    <View className="mx-2 mb-4 overflow-hidden rounded-[12px] bg-white">
      <View className="px-2 pb-5 pt-4">
        <Text
          className="mb-3 font-inter-bold text-brand-text"
          style={{
            fontSize: moderateScale(15),
            lineHeight: moderateScale(20),
          }}
        >
          {section.title}
        </Text>

        <View
          style={
            isDescription && !expanded
              ? { maxHeight: DESCRIPTION_PREVIEW_HEIGHT, overflow: "hidden" }
              : undefined
          }
        >
          <View
            onLayout={(event) => {
              if (isDescription) {
                setDescriptionHeight(event.nativeEvent.layout.height);
              }
            }}
          >
            <ProductSectionView section={section} contained={false} />
          </View>

          {isLongDescription && !expanded ? (
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0)", "#FFFFFF"]}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                left: 0,
                height: exactScale(56),
              }}
            />
          ) : null}
        </View>

        {isLongDescription ? (
          <Touchable
            onPress={() => setExpanded((current) => !current)}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            className="mt-3 self-start px-2 py-1"
          >
            <Text
              className="font-inter-bold text-brand-primary"
              style={{ fontSize: moderateScale(13) }}
            >
              {expanded ? "View Less" : "View More"}
            </Text>
          </Touchable>
        ) : null}
      </View>
    </View>
  );
};

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
