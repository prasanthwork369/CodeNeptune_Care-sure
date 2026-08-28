import React from "react";
import { View, ScrollView, Text } from "react-native";
import { Image } from "expo-image";
import { icons } from "@/src/constants/icons";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import type { CategoryCard } from "@/src/features/home/types";
import { useTabBarStore } from "@/src/store/useTabBarStore";
import { exactScale } from "@/src/utils/exactScale";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { usePrefetchCategoryProducts } from "@/src/features/categories/hooks/useCategories";
import { styles as s } from "./CategoriesGrid.styles";

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
  const prefetchCategory = usePrefetchCategoryProducts();
  const tabBarHeight = useTabBarStore((state) => state.tabBarHeight);

  if (isLoading) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={s.scrollView}
        contentContainerStyle={{
          padding,
          paddingBottom: tabBarHeight + safeAreaBottom + exactScale(32),
        }}
      >
        <View style={s.skeletonGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton
              key={i}
              width={cardWidth}
              height={cardHeight}
              borderRadius={exactScale(12)}
            />
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={s.scrollView}
      contentContainerStyle={[
        s.scrollContent,
        {
          padding,
          paddingBottom: tabBarHeight + safeAreaBottom + exactScale(32),
        },
      ]}
    >
      <View style={s.gridContainer}>
        {Array.from({ length: Math.ceil(Math.max(cards.length, 3) / 3) }).map(
          (_, rowIndex) => (
            <View key={`row-${rowIndex}`} style={s.gridRow}>
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
                    onPressIn={() =>
                      prefetchCategory({
                        categorySlug: card.familySlug || card.slug,
                        subCategorySlug: card.familySlug
                          ? card.slug
                          : undefined,
                      })
                    }
                    style={[
                      s.cardTouchable,
                      {
                        width: cardWidth,
                        height: cardHeight,
                      },
                    ]}
                  >
                    {/* Light blue rounded image container matching design */}
                    <View
                      style={[
                        s.imageContainer,
                        {
                          width: cardWidth,
                          height: cardWidth,
                        },
                      ]}
                    >
                      <icons.placeholder
                        width={cardWidth * 0.52}
                        height={cardWidth * 0.52}
                      />
                      {card.image ? (
                        <Image
                          source={card.image}
                          style={s.cardImage}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                        />
                      ) : null}
                    </View>

                    {/* Category Title Text below the image container */}
                    <Text
                      style={s.cardLabel}
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
CategoriesGrid.displayName = "CategoriesGrid";
