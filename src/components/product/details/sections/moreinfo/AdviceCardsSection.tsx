import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { SafetyAdviceItem } from "@/src/types/productSection";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useRef, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";

const CARD_WIDTH_COLLAPSED = exactScale(175);
const CARD_WIDTH_EXPANDED = exactScale(280);
const PREVIEW_LENGTH = 80;

const badgeColors = (label: string) => {
  const normalized = label.toUpperCase();
  if (normalized.includes("UNSAFE") || normalized.includes("AVOID")) {
    return { backgroundColor: "#FFE3E3", color: "#BC0808" };
  }
  if (normalized.includes("SAFE")) {
    return { backgroundColor: "#EDFDF4", color: "#006C51" };
  }
  if (normalized.includes("CAUTION") || normalized.includes("CONSULT")) {
    return { backgroundColor: "#F8FFDE", color: "#98950E" };
  }
  return { backgroundColor: "#EDFDF4", color: "#006C51" };
};

// Mirrors the original CareSure "How It Works" carousel: compact horizontal
// cards expand in place and the selected card recentres in the viewport.
export const AdviceCardsSection: React.FC<{ items: SafetyAdviceItem[] }> = ({
  items,
}) => {
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const cardsScrollRef = useRef<ScrollView>(null);
  const cardXOffsets = useRef<Record<string, number>>({});

  const toggleExpand = (id: string) => {
    const isExpanding = expandedCardId !== id;
    setExpandedCardId((current) => (current === id ? null : id));

    if (isExpanding && cardXOffsets.current[id] !== undefined) {
      setTimeout(() => {
        const screenWidth = Dimensions.get("window").width;
        const centeredX = Math.max(
          0,
          cardXOffsets.current[id] - (screenWidth - CARD_WIDTH_EXPANDED) / 2,
        );
        cardsScrollRef.current?.scrollTo({
          x: centeredX,
          animated: true,
        });
      }, 80);
    }
  };

  return (
    <ScrollView
      ref={cardsScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4 pb-2"
      contentContainerStyle={{ paddingRight: exactScale(16) }}
      bounces={false}
      overScrollMode="never"
    >
      <View className="flex-row items-stretch">
        {items.map((item, index) => {
          const id = item.title || String(index);
          const description = item.description ?? "";
          const isExpanded = expandedCardId === id;
          const expandable = description.length > PREVIEW_LENGTH;
          const visibleDescription =
            expandable && !isExpanded
              ? `${description.slice(0, PREVIEW_LENGTH)}...`
              : description;
          const colors = item.label ? badgeColors(item.label) : null;

          return (
            <Animated.View
              key={`${id}-${index}`}
              layout={LinearTransition.duration(250).easing(
                Easing.out(Easing.quad),
              )}
              className="mr-3 rounded-[12px] border border-[#919EAB33] bg-white p-3"
              style={{
                width: isExpanded ? CARD_WIDTH_EXPANDED : CARD_WIDTH_COLLAPSED,
              }}
              onLayout={(event) => {
                cardXOffsets.current[id] = event.nativeEvent.layout.x;
              }}
            >
              <View
                className="mb-3 items-center justify-center rounded-[8px] bg-[#F1EDFD]"
                style={{
                  width: exactScale(48),
                  height: exactScale(48),
                }}
              >
                {item.image ? (
                  <RemoteIcon uri={item.image} size={exactScale(24)} />
                ) : null}
              </View>

              {item.title ? (
                <Text
                  className="mb-2 font-inter-semibold text-brand-text"
                  style={{ fontSize: moderateScale(14) }}
                >
                  {item.title}
                </Text>
              ) : null}

              {colors && item.label ? (
                <View
                  className="mb-2 self-start rounded-[4px] px-2 py-1"
                  style={{ backgroundColor: colors.backgroundColor }}
                >
                  <Text
                    className="font-inter-semibold"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{
                      color: colors.color,
                      fontSize: moderateScale(10),
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ) : null}

              {description ? (
                <Text
                  className="font-inter-medium text-brand-subtext"
                  style={{
                    fontSize: moderateScale(12),
                    lineHeight: moderateScale(18),
                  }}
                >
                  {visibleDescription}
                  {expandable ? (
                    <Text
                      onPress={() => toggleExpand(id)}
                      className="font-inter-bold text-[#0F7635]"
                      style={{ fontSize: moderateScale(14) }}
                    >
                      {isExpanded ? " Show less" : " Read More"}
                    </Text>
                  ) : null}
                </Text>
              ) : null}
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
};
