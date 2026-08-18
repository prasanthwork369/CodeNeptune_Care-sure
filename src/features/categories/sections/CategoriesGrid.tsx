import React from "react";
import { View, ScrollView, Text } from "react-native";
import {
  gridStyles as s,
  CARD_RADIUS,
  CARD_WIDTH,
  CARD_IMAGE_LEFT,
  CARD_IMAGE_WIDTH,
  CARD_IMAGE_HEIGHT,
} from "../categories.styles";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import type { CategoryCard } from "@/src/types/home";
import { useTabBarStore } from "@/src/store/useTabBarStore";
import { moderateScale } from "@/src/utils/exactScale";
import { Skeleton } from "@/src/components/ui/Skeleton";

interface CategoriesGridProps {
  cards: CategoryCard[];
  cardWidth: number;
  cardHeight: number;
  padding: number;
  safeAreaBottom: number;
  isLoading?: boolean;
}

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  cards,
  cardWidth,
  cardHeight,
  padding,
  safeAreaBottom,
  isLoading,
}) => {
  const router = useNav();
  // cardImage's left/width/height in categories.styles.ts were authored
  // against the fixed CARD_WIDTH design value — since cardWidth is now
  // computed dynamically to fill the grid, scale those proportionally too
  // so the image keeps reaching the card's right/bottom edge as designed.
  const imageScale = cardWidth / CARD_WIDTH;
  const cardImageStyle = {
    ...s.cardImage,
    left: CARD_IMAGE_LEFT * imageScale,
    width: CARD_IMAGE_WIDTH * imageScale,
    height: CARD_IMAGE_HEIGHT * imageScale,
  };

  const tabBarHeight = useTabBarStore((s) => s.tabBarHeight);

  if (isLoading) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          padding,
          paddingBottom: tabBarHeight + safeAreaBottom + 32,
        }}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton
              key={i}
              width={cardWidth}
              height={cardHeight}
              borderRadius={12}
            />
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, height: "100%" }}
      contentContainerStyle={{
        padding: padding,
        flexGrow: 1,
        paddingBottom: tabBarHeight + safeAreaBottom + 32,
      }}
    >
      <View style={{ gap: 14 }}>
        {Array.from({ length: Math.ceil(Math.max(cards.length, 3) / 3) }).map(
          (_, rowIndex) => (
            <View key={`row-${rowIndex}`} style={{ flexDirection: "row", gap: 10 }}>
              {[0, 1, 2].map((col) => {
                const index = rowIndex * 3 + col;
                const card = cards[index];
                if (!card) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={{ width: cardWidth, height: cardHeight }}
                    />
                  );
                }
                return (
                  <Touchable
                    key={card.id}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({
                        pathname: "/category/[id]",
                        params: {
                          id: card.id,
                          slug: card.slug,
                          familySlug: card.familySlug,
                          name: card.label.replace("\n", " "),
                        },
                      })
                    }
                    style={{
                      width: cardWidth,
                      height: cardHeight,
                      alignItems: "center",
                    }}
                  >
                    {/* Light blue rounded image container matching design */}
                    <View
                      style={{
                        width: cardWidth,
                        height: cardWidth,
                        backgroundColor: "#EDF4FE",
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 2,
                      }}
                    >
                      <Image
                        source={card.image}
                        style={{ width: "92%", height: "92%" }}
                        contentFit="contain"
                      />
                    </View>

                    {/* Category Title Text below the image container */}
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        lineHeight: moderateScale(14),
                        textAlign: "center",
                        color: "#1E293B",
                        marginTop: 6,
                      }}
                      className="font-inter-semibold"
                      numberOfLines={2}
                    >
                      {card.label.replace("\n", " ")}
                    </Text>
                  </Touchable>
                );
              })}
            </View>
          ),
        )}
      </View>
    </ScrollView>
  );
};
