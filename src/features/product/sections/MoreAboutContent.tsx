import { Touchable } from "@/src/components/ui/Touchable";
import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";
import { ProductSection } from "@/src/features/product/types";
import { exactScale } from "@/src/utils/exactScale";
import { htmlToPlainText } from "@/src/utils/productSections";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { ProductSectionView } from "./moreinfo/ProductSectionView";
import { styles as s } from "./product-sections.styles";

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
    <View style={s.moreAboutContentCard}>
      <View style={s.moreAboutContentInner}>
        <Text style={s.moreAboutSectionTitle}>
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
            style={s.viewMoreToggleBtn}
          >
            <Text style={s.viewMoreToggleText}>
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
  <Text style={s.moreAboutHeading}>
    More about {medicineName}
  </Text>
);
