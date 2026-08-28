import { HtmlContent } from "@/src/components/ui/HtmlContent";
import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";
import { ProductSection } from "@/src/features/product/types";
import React from "react";
import { Text, View } from "react-native";
import { AdviceCardsSection } from "./AdviceCardsSection";
import { BulletListSection } from "./BulletListSection";
import { FaqSection } from "./FaqSection";
import { KeyValueSection } from "./KeyValueSection";
import { styles as s } from "./moreinfo.styles";

const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <View style={s.sectionCard}>
    <Text style={s.sectionCardTitle}>
      {title}
    </Text>
    {children}
  </View>
);

// One switch on design_type — adding a sixth layout means one case, nothing else changes.
const renderBody = (section: ProductSection) => {
  switch (section.designType) {
    case SECTION_DESIGN_TYPE.TEXT_BLOCK:
      return <HtmlContent content={section.html} />;
    case SECTION_DESIGN_TYPE.BULLET_LIST:
      return <BulletListSection points={section.points} />;
    case SECTION_DESIGN_TYPE.FAQ_ACCORDION:
      return <FaqSection faqs={section.faqs} />;
    case SECTION_DESIGN_TYPE.ICON_ADVICE_CARDS:
      return <AdviceCardsSection items={section.items} />;
    case SECTION_DESIGN_TYPE.KEY_VALUE_TABLE:
      return <KeyValueSection rows={section.rows} />;
  }
};

interface ProductSectionViewProps {
  section: ProductSection;
  contained?: boolean;
}

export const ProductSectionView: React.FC<ProductSectionViewProps> = React.memo(
  ({ section, contained = true }) => {
    const body = renderBody(section);
    return contained ? (
      <SectionCard title={section.title}>{body}</SectionCard>
    ) : (
      body
    );
  },
);

ProductSectionView.displayName = "ProductSectionView";
