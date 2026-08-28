import { useThumbnailRemoval } from "@/src/components/animations/flyToCart";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import { Image, type ImageSource } from "expo-image";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

// Exported so the banner can centre the smoke puff on the same circle.
export const CART_THUMB_SIZE = exactScale(44);

interface CartBannerThumbnailProps {
  /** Cart rows carry a URI string; an optimistic add carries an ImageSource or require number. */
  image?: ImageSource | string | number | null;
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

  const [prevImage, setPrevImage] = useState(image);
  const [hasError, setHasError] = useState(false);

  if (prevImage !== image) {
    setPrevImage(image);
    setHasError(false);
  }

  const size = CART_THUMB_SIZE;
  const imageSize = exactScale(30);

  // Normalize source to support remote URI string, ImageSource object, and local require(...) number.
  // Falsy values, empty strings, and empty URI objects resolve to undefined so the local placeholder SVG renders.
  const source = useMemo(() => {
    if (!image) return undefined;
    if (typeof image === "number") return image;
    if (typeof image === "string") {
      const trimmed = image.trim();
      return trimmed.length > 0 ? { uri: trimmed } : undefined;
    }
    if (typeof image === "object") {
      if ("uri" in image) {
        const uri = image.uri;
        if (typeof uri === "string" && uri.trim().length > 0) {
          return { ...image, uri: uri.trim() };
        }
        return undefined;
      }
      return image;
    }
    return undefined;
  }, [image]);

  const showImage = Boolean(source && !hasError);

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
          {showImage ? (
            <Image
              source={source}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              cachePolicy="memory-disk"
              onError={() => setHasError(true)}
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
