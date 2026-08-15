import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { FaqItem } from "@/src/types/productSection";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { Text, View } from "react-native";

const INITIAL_FAQ_COUNT = 4;

const FaqRow: React.FC<FaqItem & { open: boolean; onToggle: () => void }> = ({
  question,
  answer,
  open,
  onToggle,
}) => {
  return (
    <View
      className="border border-[#F1F2F4] rounded-[12px] bg-white overflow-hidden"
      style={{ marginTop: exactScale(8) }}
    >
      <Touchable
        onPress={onToggle}
        throttleMs={0}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between"
        style={{ padding: exactScale(14) }}
      >
        <Text
          className="flex-1 font-inter-bold text-brand-text"
          style={{
            fontSize: moderateScale(14),
            lineHeight: moderateScale(19),
            marginRight: exactScale(10),
          }}
        >
          {question}
        </Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
          <icons.arrow_down width={exactScale(14)} height={exactScale(14)} />
        </View>
      </Touchable>

      {open ? (
        <View
          className="border-t border-[#F6F7F8]"
          style={{ padding: exactScale(14) }}
        >
          <Text
            className="font-inter-medium text-[#5E6670]"
            style={{
              fontSize: moderateScale(13),
              lineHeight: moderateScale(20),
            }}
          >
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
    <View style={{ marginTop: -exactScale(8) }}>
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
          className="mt-3 self-start px-2 py-1"
        >
          <Text
            className="font-inter-bold text-brand-primary"
            style={{ fontSize: moderateScale(13) }}
          >
            {showAll ? "View Less FAQs" : "View More FAQs"}
          </Text>
        </Touchable>
      ) : null}
    </View>
  );
};
