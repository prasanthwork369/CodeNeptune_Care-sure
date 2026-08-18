import React from "react";
import { View, Text } from "react-native";
import { styles as s } from "./CategoryCards.styles";
import { Touchable } from "@/src/components/ui/Touchable";
import { Image } from "expo-image";
import { icons } from "@/src/constants/icons";
import type { CategoryCard } from "@/src/features/home/types";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import { useResponsiveTier } from "@/src/hooks/ui/useResponsiveTier";

interface CategoryCardsProps {
  cards: CategoryCard[];
  // Passes the whole card so the handler does not have to look it up again.
  onCardPress?: (card: CategoryCard) => void;
  isLoading?: boolean;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  cards,
  onCardPress,
  isLoading,
}) => {
  const { width, pick } = useResponsiveTier();
  const numColumns = pick(2, 3, 4);
  const scaledGap = exactScale(8);
  const scaledPad = exactScale(16);
  const cardWidth =
    (width - scaledPad * 2 - scaledGap * (numColumns - 1)) / numColumns;
  const cardHeight = cardWidth * (128 / 114);

  if (isLoading) {
    return (
      <View style={s.container}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            width={cardWidth}
            height={cardHeight}
            borderRadius={exactScale(10)}
          />
        ))}
      </View>
    );
  }

  const remainder = cards.length % numColumns;
  const placeholders = remainder === 0 ? 0 : numColumns - remainder;

  return (
    <View style={s.container}>
      {cards.map((card) => (
        <Touchable
          key={card.id}
          activeOpacity={0.5}
          onPress={() => onCardPress?.(card)}
          accessibilityRole="button"
          accessibilityLabel={card.label}
          style={{
            backgroundColor: card.bgColor,
            width: cardWidth,
            height: cardHeight,
            borderRadius: exactScale(10),
          }}
          className="overflow-hidden justify-start"
        >
          <Text
            style={s.cardLabel}
            className="font-inter-semibold text-brand-text leading-tight z-10"
          >
            {card.label}
          </Text>
          {card.image ? (
            <Image
              source={card.image}
              style={{
                width: cardWidth * (77 / 114),
                height: cardHeight * (87.106 / 128),
                position: "absolute",
                top: cardHeight * (48 / 128),
                left: cardWidth * (35 / 114),
                borderRadius: exactScale(8),
              }}
              contentFit="contain"
            />
          ) : (
            <icons.placeholder
              width={cardWidth * (77 / 114) * 0.65}
              height={cardHeight * (87.10625457763672 / 128) * 0.65}
              style={{
                position: "absolute",
                top: cardHeight * (48 / 128) + 4,
                left: cardWidth * (43 / 114) + 4,
              }}
            />
          )}
        </Touchable>
      ))}
      {Array.from({ length: placeholders }).map((_, i) => (
        <View key={`pad-${i}`} style={{ width: cardWidth }} />
      ))}
    </View>
  );
};
