import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS, HOME_IMAGES } from "@/src/constants/images";
import { exactScale } from "@/src/utils/exactScale";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { styles as s } from "./product-sections.styles";

// Displays product salt composition with an expand/collapse toggle
interface SaltCompositionBannerProps {
  composition: string;
}

export const SaltCompositionBanner: React.FC<SaltCompositionBannerProps> = ({
  composition,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState(false);

  return (
    <Touchable
      activeOpacity={isTruncatable ? 0.9 : 1}
      onPress={() => isTruncatable && setExpanded((v) => !v)}
      style={s.saltRoot}
    >
      <Image
        source={HOME_IMAGES.productBackground}
        resizeMode="cover"
        style={s.saltBgImage}
      />
      <View style={s.saltContentRow}>
        <View style={s.saltBeakerWrap}>
          <DotLottie
            source={ANIMATIONS.chemicalBeaker}
            autoplay
            loop
            style={s.saltBeakerAnimation}
          />
        </View>
        <View
          style={[
            s.saltTextCol,
            { marginRight: isTruncatable ? exactScale(8) : 0 },
          ]}
        >
          <Text style={s.saltSubHeading}>SALT COMPOSITION IN BOTH</Text>
          {/* Hidden measurement text */}
          <Text
            style={[
              s.saltCompositionText,
              {
                position: "absolute",
                width: "100%",
                opacity: 0,
              },
            ]}
            pointerEvents="none"
            onTextLayout={(e) =>
              setIsTruncatable(e.nativeEvent.lines.length > 1)
            }
          >
            {composition}
          </Text>
          <Text
            style={s.saltCompositionText}
            numberOfLines={expanded ? undefined : 1}
            ellipsizeMode="tail"
          >
            {composition}
          </Text>
        </View>
        {/* Expand/Collapse Toggle Button */}
        {isTruncatable && (
          <View style={s.saltChevronBtn}>
            <View
              style={{
                transform: [{ rotate: expanded ? "180deg" : "0deg" }],
              }}
            >
              <icons.arrow_down
                width={exactScale(14)}
                height={exactScale(14)}
                color="#FFFFFF"
              />
            </View>
          </View>
        )}
      </View>
    </Touchable>
  );
};
