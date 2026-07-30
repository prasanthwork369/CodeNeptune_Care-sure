import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { FaqItem } from "@/src/types/productSection";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { Text, View } from "react-native";

const FaqRow: React.FC<FaqItem & { defaultOpen?: boolean }> = ({
  question,
  answer,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View
      className="border border-[#F1F2F4] rounded-[12px] bg-white overflow-hidden"
      style={{ marginTop: exactScale(8) }}
    >
      <Touchable
        onPress={() => setOpen((prev) => !prev)}
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

export const FaqSection: React.FC<{ faqs: FaqItem[] }> = ({ faqs }) => (
  <View style={{ marginTop: -exactScale(8) }}>
    {faqs.map((faq, index) => (
      <FaqRow key={faq.question} {...faq} defaultOpen={index === 0} />
    ))}
  </View>
);
