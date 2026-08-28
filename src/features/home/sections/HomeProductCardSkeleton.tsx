import React from "react";
import { ScrollView, View } from "react-native";
import { CART_BUTTON_HEIGHT } from "@/src/constants/theme";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./HomeProductCardSkeleton.styles";

const CardSkeleton = () => {
  const cardWidth = exactScale(164);
  const imageSize = cardWidth * 0.69;
  const cardHeight = imageSize * 1.5 + 160;

  return (
    <View
      style={[
        s.cardRoot,
        {
          width: cardWidth,
          height: cardHeight,
        },
      ]}
    >
      {/* Image area */}
      <View
        style={[
          s.imageArea,
          { height: imageSize * 1.5 },
        ]}
      >
        <Skeleton
          width={imageSize}
          height={imageSize}
          borderRadius={exactScale(8)}
        />
      </View>

      {/* Details area */}
      <View style={s.detailsArea}>
        <Skeleton
          width="85%"
          height={exactScale(14)}
          style={s.line1}
        />
        <Skeleton
          width="60%"
          height={exactScale(12)}
          style={s.line2}
        />
        <View style={s.pricesRow}>
          <Skeleton width={exactScale(48)} height={exactScale(16)} />
          <Skeleton width={exactScale(36)} height={exactScale(12)} />
        </View>
      </View>

      {/* Add to cart button */}
      <View style={s.buttonArea}>
        <Skeleton
          width="100%"
          height={CART_BUTTON_HEIGHT}
          borderRadius={exactScale(10)}
        />
      </View>
    </View>
  );
};

export const HomeProductCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    scrollEnabled={false}
    contentContainerStyle={s.scrollContent}
  >
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </ScrollView>
);
