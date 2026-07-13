import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS, HOME_IMAGES } from "@/src/constants/images";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

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
      style={{
        borderRadius: exactScale(12),
        overflow: "hidden",
        paddingHorizontal: exactScale(16),
        borderBottomWidth: 1,
        borderBottomColor: "#919EAB33",
        borderStyle: "dashed",
        backgroundColor: "#14835A",
        minHeight: exactScale(40),
      }}
      className="mx-4 my-4"
    >
      <Image
        source={HOME_IMAGES.productBackground}
        resizeMode="cover"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <View
        className="flex-row items-center relative z-10 w-full"
        style={{ minHeight: exactScale(46), paddingVertical: exactScale(6) }}
      >
        <View className="items-center justify-center mr-2">
          <DotLottie
            source={ANIMATIONS.chemicalBeaker}
            autoplay
            loop
            style={{ width: exactScale(56), height: exactScale(56) }}
          />
        </View>
        <View style={{ flex: 1, marginRight: isTruncatable ? 8 : 0 }}>
          <Text className="font-inter-semibold text-white uppercase tracking-[1px] mb-0.5" style={{ fontSize: moderateScale(10) }}>
            SALT COMPOSITION IN BOTH
          </Text>
          {/* Hidden measurement text — detects if composition overflows one
              line. Must match the visible text's width and font exactly,
              otherwise it wraps differently and reports the wrong line
              count (e.g. always >1 with no width constraint). */}
          <Text
            className="font-inter-bold"
            style={{
              position: "absolute",
              width: "100%",
              opacity: 0,
              pointerEvents: "none",
              fontSize: moderateScale(15),
            }}
            onTextLayout={(e) =>
              setIsTruncatable(e.nativeEvent.lines.length > 1)
            }
          >
            {composition}
          </Text>
          <Text
            className="font-inter-bold text-white leading-tight"
            numberOfLines={expanded ? undefined : 1}
            ellipsizeMode="tail"
            style={{ fontSize: moderateScale(15) }}
          >
            {composition}
          </Text>
        </View>
        {/* Expand/Collapse Toggle Button */}
        {isTruncatable && (
          <View
            style={{
              width: exactScale(28),
              height: exactScale(28),
              borderRadius: exactScale(14),
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {expanded ? (
              <icons.arrow_up_circle width={24} height={24} color="#FFFFFF" />
            ) : (
              <icons.arrow_down_circle width={24} height={24} color="#FFFFFF" />
            )}
          </View>
        )}
      </View>
    </Touchable>
  );
};
