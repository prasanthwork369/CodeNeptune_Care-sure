import { Image } from "expo-image";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { SvgUri } from "react-native-svg";

import { ApiAppContent } from "@/src/types/home";
import {
    exactScale,
    moderateScale,
    verticalScale,
} from "@/src/utils/exactScale";
import { styles as s } from "./HomeFooter.styles";

interface HomeFooterProps {
  appContent?: ApiAppContent;
  isLoading?: boolean;
}

const isSvg = (url: string) => url?.toLowerCase().endsWith(".svg");

const RemoteIcon: React.FC<{ uri: string; style?: any }> = ({ uri, style }) => {
  if (isSvg(uri)) {
    return (
      <SvgUri
        uri={uri}
        width={style?.width}
        height={style?.height}
        style={style}
      />
    );
  }
  return <Image source={{ uri }} style={style} contentFit="contain" />;
};

export const HomeFooter: React.FC<HomeFooterProps> = ({
  appContent,
  isLoading,
}) => {
  const { width } = useWindowDimensions();

  if (isLoading || !appContent) {
    return <View className="h-20" />;
  }

  const promiseTitle = appContent.promise?.title;
  const footerTitle = appContent.footer?.title ?? "";
  const footerImageUrl = appContent.footer?.imageUrl;
  const footerHeartUrl = appContent.footer?.iconUrl;

  const footerWords = footerTitle.split(" ");

  return (
    <View>
      {/* Always With You Banner */}
      {footerHeartUrl ? (
        <View
          style={{
            paddingTop: exactScale(39),
            paddingBottom: 0,
            paddingHorizontal: exactScale(20),
          }}
        >
          {isSvg(footerHeartUrl) ? (
            <SvgUri
              uri={footerHeartUrl}
              width={exactScale(148)}
              height={exactScale(117)}
            />
          ) : (
            <Image
              source={{ uri: footerHeartUrl }}
              style={{ width: exactScale(148), height: exactScale(117) }}
              contentFit="contain"
              contentPosition="top"
            />
          )}
        </View>
      ) : null}

      {/* Skyline with text overlay at bottom-left */}
      {footerImageUrl ? (
        <View
          style={{
            width: width,
            height: exactScale(273),
            marginTop: exactScale(10),
          }}
        >
          <Image
            source={{ uri: footerImageUrl }}
            style={{ width: width, height: exactScale(312) }}
            contentFit="cover"
            contentPosition="bottom"
          />
          <View
            style={{
              position: "absolute",
              left: exactScale(20),
              top: 20,
              gap: 0,
            }}
          >
            {footerWords.map((word, idx) => (
              <Text
                key={idx}
                style={{
                  fontSize: moderateScale(60, 0.1),
                  lineHeight: verticalScale(55),
                }}
                className="font-inter-extrabold text-[#D4D4D4] uppercase"
              >
                {word}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {/* Sub-footer trust labels */}
      <View
        className="flex-row justify-between items-start w-full px-5"
        style={{ paddingBottom: exactScale(20), paddingTop: exactScale(30) }}
      >
        {(appContent.footer?.labels ?? []).map((label, idx) => {
          const isLeft = idx === 0;
          const isRight = idx === 2;
          const textAlign = isLeft ? "left" : isRight ? "right" : "center";

          return (
            <View key={idx} className="items-start">
              <View className={`h-6 justify-center`}>
                <RemoteIcon uri={label.icon} style={s.icon} />
              </View>
              <Text style={[s.label, { textAlign }]} className="mt-1">
                {label.text}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
