import { useThumbnailRemoval } from "@/src/components/animations/flyToCart";
import { icons } from "@/src/constants/icons";
import { Image, type ImageSource } from "expo-image";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import {
  CART_THUMB_SIZE,
  IMAGE_SIZE,
  styles as s,
} from "./CartBannerThumbnail.styles";

export { CART_THUMB_SIZE };

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
  const imageSize = IMAGE_SIZE;

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
          s.thumbContainer,
        ]}
      >
        <Animated.View
          style={[
            s.imageWrapper,
            imageStyle,
          ]}
        >
          {showImage ? (
            <Image
              source={source}
              style={s.image}
              contentFit="contain"
              cachePolicy="memory-disk"
              onError={() => setHasError(true)}
            />
          ) : (
            <icons.placeholder width={imageSize} height={imageSize} />
          )}
        </Animated.View>

        {/* White mask */}
        <Animated.View
          style={[
            maskStyle,
            s.mask,
          ]}
        />
      </Animated.View>
    </View>
  );
};
