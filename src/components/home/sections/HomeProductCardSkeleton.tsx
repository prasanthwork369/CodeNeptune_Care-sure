import React from "react";
import { ScrollView, View } from "react-native";
import { CART_BUTTON_HEIGHT } from "@/src/constants/theme";
import { Skeleton } from "../../ui/Skeleton";
import { exactScale } from "@/src/utils/exactScale";

const CardSkeleton = () => {
  const cardWidth = exactScale(164);
  const imageSize = cardWidth * 0.69;
  const cardHeight = imageSize * 1.5 + 160;

  return (
    <View
      className="bg-white rounded-[12px] overflow-hidden"
      style={{
        width: cardWidth,
        height: cardHeight,
        borderWidth: 0.77,
        borderColor: "#919EAB33",
      }}
    >
      {/* Image area */}
      <View
        style={{ height: imageSize * 1.5 }}
        className="items-center justify-center px-2 pb-2 pt-7"
      >
        <Skeleton
          width={imageSize}
          height={imageSize}
          borderRadius={exactScale(8)}
        />
      </View>

      {/* Details area */}
      <View style={{ backgroundColor: "#F2FFF9" }} className="flex-1 px-3 pt-3">
        <Skeleton
          width="85%"
          height={exactScale(14)}
          style={{ marginBottom: exactScale(6) }}
        />
        <Skeleton
          width="60%"
          height={exactScale(12)}
          style={{ marginBottom: exactScale(10) }}
        />
        <View className="flex-row items-center gap-x-2">
          <Skeleton width={exactScale(48)} height={exactScale(16)} />
          <Skeleton width={exactScale(36)} height={exactScale(12)} />
        </View>
      </View>

      {/* Add to cart button */}
      <View style={{ backgroundColor: "#F2FFF9" }} className="px-3 pb-3 pt-2">
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
    contentContainerStyle={{
      paddingLeft: exactScale(20),
      paddingRight: exactScale(40),
      gap: exactScale(14),
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </ScrollView>
);
