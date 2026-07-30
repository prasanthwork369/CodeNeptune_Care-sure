import { HOME_IMAGES, ANIMATIONS } from "@/src/constants/images";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React from "react";
import { Image, Text, View } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";
interface SaltCompositionBannerProps {
  composition: string;
}

export const SaltCompositionBanner: React.FC<SaltCompositionBannerProps> = ({
  composition,
}) => {
  return (
    <View
      style={{
        height: 54,
        borderRadius: 12,
        overflow: "hidden",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#919EAB33",
        borderStyle: "dashed",
        backgroundColor: "#14835A",
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
      <View className="flex-row items-center relative z-10 w-full h-full mt-1">
        <View className="items-center justify-center">
          <DotLottie
            source={ANIMATIONS.chemicalBeaker}
            autoplay
            loop
            style={{ width: 40, height: 60 }}
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-inter-semibold text-white uppercase tracking-[1px] mb-0.5"
            style={{ fontSize: moderateScale(10) }}
          >
            SALT COMPOSITION IN BOTH
          </Text>
          <Text
            className="font-inter-bold text-white leading-tight"
            style={{ fontSize: moderateScale(15) }}
          >
            {composition}
          </Text>
        </View>
      </View>
    </View>
  );
};
