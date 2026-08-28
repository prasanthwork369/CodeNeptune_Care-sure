import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { FaqItem } from "@/src/features/product/types";
import { exactScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { styles as s } from "./moreinfo.styles";

const INITIAL_FAQ_COUNT = 4;

const FaqRow: React.FC<FaqItem & { open: boolean; onToggle: () => void }> = ({
  question,
  answer,
  open,
  onToggle,
}) => {
  return (
    <View style={s.faqRow}>
      <Touchable
        onPress={onToggle}
        throttleMs={0}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={s.faqHeader}
      >
        <Text style={s.faqQuestion}>
          {question}
        </Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <icons.arrow_down width={exactScale(14)} height={exactScale(14)} />
        </View>
      </Touchable>

      {open ? (
        <View style={s.faqAnswerContainer}>
          <Text style={s.faqAnswerText}>
            {answer}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export const FaqSection: React.FC<{ faqs: FaqItem[] }> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(
    faqs.length ? 0 : null,
  );
  const [showAll, setShowAll] = useState(false);
  const hasMoreFaqs = faqs.length > INITIAL_FAQ_COUNT;
  const visibleFaqs = showAll ? faqs : faqs.slice(0, INITIAL_FAQ_COUNT);

  const toggleShowAll = () => {
    if (showAll && openIndex !== null && openIndex >= INITIAL_FAQ_COUNT) {
      setOpenIndex(null);
    }
    setShowAll((current) => !current);
  };

  return (
    <View style={s.faqContainer}>
      {visibleFaqs.map((faq, index) => (
        <FaqRow
          key={`${faq.question}-${index}`}
          {...faq}
          open={openIndex === index}
          onToggle={() =>
            setOpenIndex((current) => (current === index ? null : index))
          }
        />
      ))}

      {hasMoreFaqs ? (
        <Touchable
          onPress={toggleShowAll}
          throttleMs={0}
          accessibilityRole="button"
          accessibilityState={{ expanded: showAll }}
          style={s.faqShowAllBtn}
        >
          <Text style={s.faqShowAllText}>
            {showAll ? "View Less FAQs" : `View All (${faqs.length}) FAQs`}
          </Text>
        </Touchable>
      ) : null}
    </View>
  );
};
