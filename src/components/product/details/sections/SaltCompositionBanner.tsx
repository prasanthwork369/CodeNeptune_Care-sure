import { Touchable } from "@/src/components/ui/Touchable";
import { ANIMATIONS, HOME_IMAGES } from "@/src/constants/images";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React, { useState } from "react";
import { Image, Text, View } from "react-native";

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
        borderRadius: 12,
        overflow: "hidden",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#919EAB33",
        borderStyle: "dashed",
        backgroundColor: "#14835A",
        minHeight: 66,
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
        style={{ minHeight: 56, paddingVertical: 8 }}
      >
        <View className="items-center justify-center">
          <DotLottie
            source={ANIMATIONS.chemicalBeaker}
            autoplay
            loop
            style={{ width: 50, height: 75 }}
          />
        </View>
        <View style={{ flex: 1, marginRight: isTruncatable ? 8 : 0 }}>
          <Text className="text-[10px] font-inter-semibold text-white uppercase tracking-[1px] mb-0.5">
            SALT COMPOSITION IN BOTH
          </Text>
          {/* Hidden measurement text — detects if composition overflows one line */}
          <Text
            style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
            onTextLayout={(e) =>
              setIsTruncatable(e.nativeEvent.lines.length > 1)
            }
          >
            {composition}
          </Text>
          <Text
            className="text-[15px] font-inter-bold text-white leading-tight"
            numberOfLines={expanded ? undefined : 1}
            ellipsizeMode="tail"
          >
            {composition}
          </Text>
        </View>
        {isTruncatable && (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MaterialCommunityIcons
              name={expanded ? "arrow-up-circle" : "arrow-down-circle"}
              size={24}
              color="#FFFFFF"
            />
          </View>
        )}
      </View>
    </Touchable>
  );
};
