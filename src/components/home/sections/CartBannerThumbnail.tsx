import { useThumbnailRemoval } from "@/src/components/animations/flyToCart";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import { Image, type ImageSource } from "expo-image";
import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

// Exported so the banner can centre the smoke puff on the same circle.
export const CART_THUMB_SIZE = exactScale(44);

interface CartBannerThumbnailProps {
  /** Cart rows carry a URI string; an optimistic add carries an ImageSource. */
  image?: ImageSource | string | null;
  isPending?: boolean;
  isRemoving?: boolean;
  isBehindRemoving?: boolean;
  /** Matches the banner's existing stacking: front circle sits 8px right. */
  absolute?: boolean;
  offsetLeft?: number;
}

// The Home cart banner's 44px circle. Same design as before — this only adds
// the removal animation the category banner's ThumbnailItem already had.
export const CartBannerThumbnail: React.FC<CartBannerThumbnailProps> = ({
  image,
  isPending,
  isRemoving,
  isBehindRemoving,
  absolute = false,
  offsetLeft = 0,
}) => {
  const { containerStyle, maskStyle, imageStyle } = useThumbnailRemoval({
    isPending,
    isRemoving,
    isBehindRemoving,
  });

  const size = CART_THUMB_SIZE;
  const imageSize = exactScale(30);

  // Wrapping an ImageSource again would hand expo-image {uri:{uri:...}}.
  const source = typeof image === "string" ? { uri: image } : image;

  // The puff is drawn by the banner, not here — the pill clips its own children.
  return (
    <View
      style={{
        position: absolute ? "absolute" : "relative",
        left: offsetLeft,
        width: size,
        height: size,
      }}
    >
      <Animated.View
        style={[
          containerStyle,
          {
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#919EAB33",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            zIndex: 1,
          },
        ]}
      >
        <Animated.View
          style={[
            {
              width: imageSize,
              height: imageSize,
              alignItems: "center",
              justifyContent: "center",
            },
            imageStyle,
          ]}
        >
          {source ? (
            <Image
              source={source}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
            />
          ) : (
            <icons.placeholder width={imageSize} height={imageSize} />
          )}
        </Animated.View>

        {/* White mask, so the image dissolves into the circle's own interior. */}
        <Animated.View
          style={[
            maskStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: "#FFFFFF",
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};
