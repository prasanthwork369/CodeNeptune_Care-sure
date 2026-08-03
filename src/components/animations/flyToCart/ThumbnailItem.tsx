import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
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

  return (
    <View
      style={{
        width: 36,
        height: 36,
        marginLeft: index > 0 ? -12 : 0,
        zIndex: 10 - index,
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
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 3,
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
              alignItems: "center",
              justifyContent: "center",
            },
            imageStyle,
          ]}
        >
          <Image
            source={imgUrl}
            style={{ width: 28, height: 28 }}
            contentFit="contain"
          />
        </Animated.View>

        {/* Absolute Mask Overlay (Green matching the banner background) */}
        <Animated.View
          style={[
            maskStyle,
            {
              position: "absolute",
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#0F7635",
              top: 0,
              left: 0,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};
