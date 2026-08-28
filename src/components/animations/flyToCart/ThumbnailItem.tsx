import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { icons } from "@/src/constants/icons";
import { SmokePuff } from "./SmokePuff";
import type { FlyImage } from "./FlyToCartContext";
import { useThumbnailRemoval } from "./useThumbnailRemoval";

interface ThumbnailItemProps {
  imgUrl: FlyImage;
  index: number;
  isPending?: boolean;
  isRemoving?: boolean;
  isBehindRemoving?: boolean;
}

export const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  imgUrl,
  index,
  isPending,
  isRemoving,
  isBehindRemoving,
}) => {
  const { containerStyle, maskStyle, imageStyle, shouldPlaySmoke } =
    useThumbnailRemoval({ isPending, isRemoving, isBehindRemoving });

  const source =
    typeof imgUrl === "string"
      ? { uri: imgUrl }
      : (imgUrl ?? undefined);

  return (
    <View
      style={{
        width: 36,
        height: 36,
        marginLeft: index > 0 ? -12 : 0,
        zIndex: index + 1,
        position: "relative",
      }}
    >
      {/* Renders above the thumbnail circle (zIndex: 5) */}
      <SmokePuff active={shouldPlaySmoke} />

      <Animated.View
        style={[
          containerStyle,
          {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#fff",
            borderWidth: 2,
            borderColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          },
        ]}
      >
        <Animated.View
          style={[
            {
              width: 28,
              height: 28,
              borderRadius: 14,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
            },
            imageStyle,
          ]}
        >
          {source ? (
            <Image
              source={source}
              style={{ width: 28, height: 28, borderRadius: 14 }}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          ) : (
            <icons.placeholder width={18} height={18} />
          )}
        </Animated.View>

        {/* White mask overlay so the image dissolves into the circle's white interior */}
        <Animated.View
          style={[
            maskStyle,
            {
              position: "absolute",
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              top: 0,
              left: 0,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};
