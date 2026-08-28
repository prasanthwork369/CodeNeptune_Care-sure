import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { SafetyAdviceItem } from "@/src/features/product/types";
import { exactScale } from "@/src/utils/exactScale";
import React, { useRef, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";
import { Touchable } from "@/src/components/ui/Touchable";
import { styles as s } from "./moreinfo.styles";

const CARD_WIDTH_COLLAPSED = exactScale(175);
const CARD_WIDTH_EXPANDED = exactScale(280);
const COLLAPSED_LINES = 4;
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
      nestedScrollEnabled
      canCancelContentTouches
      directionalLockEnabled
      scrollEnabled
      showsHorizontalScrollIndicator={false}
      style={s.adviceScroll}
      contentContainerStyle={s.adviceScrollContent}
      bounces={false}
      overScrollMode="never"
    >
      <View style={s.adviceCardsRow}>
        {items.map((item, index) => {
          const id = item.title || String(index);
          const description = item.description ?? "";
          const isExpanded = expandedCardId === id;
          const expandable = description.length > PREVIEW_LENGTH;
          const colors = item.label ? badgeColors(item.label) : null;

          return (
            <Animated.View
              key={`${id}-${index}`}
              layout={LinearTransition.duration(250).easing(
                Easing.out(Easing.quad),
              )}
              style={[
                s.adviceCard,
                {
                  width: isExpanded
                    ? CARD_WIDTH_EXPANDED
                    : CARD_WIDTH_COLLAPSED,
                },
              ]}
              onLayout={(event) => {
                cardXOffsets.current[id] = event.nativeEvent.layout.x;
              }}
            >
              {item.image ? (
                <RemoteIcon
                  uri={item.image}
                  size={exactScale(48)}
                  style={s.adviceIcon}
                />
              ) : null}

              {item.title ? (
                <Text style={s.adviceTitle}>
                  {item.title}
                </Text>
              ) : null}

              {colors && item.label ? (
                <View
                  style={[
                    s.adviceBadge,
                    { backgroundColor: colors.backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      s.adviceBadgeText,
                      { color: colors.color },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {item.label}
                  </Text>
                </View>
              ) : null}

              {description ? (
                <>
                  <Text
                    numberOfLines={isExpanded ? undefined : COLLAPSED_LINES}
                    style={s.adviceDescription}
                  >
                    {description}
                  </Text>

                  {expandable ? (
                    <Touchable
                      onPress={() => toggleExpand(id)}
                      throttleMs={0}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isExpanded }}
                      style={s.adviceExpandBtn}
                    >
                      <Text style={s.adviceExpandText}>
                        {isExpanded ? "View Less" : "View More"}
                      </Text>
                    </Touchable>
                  ) : null}
                </>
              ) : null}
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
};
