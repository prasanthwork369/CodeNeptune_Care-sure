import type { ImageStyle } from "react-native";
import { Image } from "expo-image";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { SvgUri } from "react-native-svg";
import { ApiAppContent } from "@/src/features/home/types";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./HomeFooter.styles";

interface HomeFooterProps {
  appContent?: ApiAppContent;
  isLoading?: boolean;
}

const isSvg = (url: string) => url?.toLowerCase().endsWith(".svg");

// A plain style object, not StyleProp — width/height are read off it below.
const RemoteIcon: React.FC<{ uri: string; style?: ImageStyle }> = ({
  uri,
  style,
}) => {
  if (isSvg(uri)) {
    // SvgUri only accepts concrete sizes — percentage/animated values are dropped.
    const width = typeof style?.width === "number" ? style.width : undefined;
    const height = typeof style?.height === "number" ? style.height : undefined;
    return <SvgUri uri={uri} width={width} height={height} style={style} />;
  }
  return <Image source={{ uri }} style={style} contentFit="contain" />;
};

export const HomeFooter: React.FC<HomeFooterProps> = React.memo(
  ({ appContent, isLoading }) => {
    const { width } = useWindowDimensions();

    if (isLoading || !appContent) {
      return <View style={s.loadingSpacer} />;
    }

    const footerTitle = appContent.footer?.title ?? "";
    const footerImageUrl = appContent.footer?.imageUrl;
    const footerHeartUrl = appContent.footer?.iconUrl;

    const footerWords = footerTitle.split(" ");

    return (
      <View>
        {/* Always With You Banner */}
        {footerHeartUrl ? (
          <View style={s.heartBanner}>
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
            }}
          >
            <Image
              source={{ uri: footerImageUrl }}
              style={{ width: width, height: "100%" }}
              contentFit="cover"
              contentPosition="bottom"
            />
            <View style={s.skylineOverlayTextWrap}>
              {footerWords.map((word, idx) => (
                <Text
                  key={idx}
                  style={s.skylineWordText}
                >
                  {word}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <View
          style={[
            s.labelsRow,
            {
              marginTop: footerImageUrl ? -exactScale(50) : 0,
            },
          ]}
        >
          {(appContent.footer?.labels ?? []).map((label, idx) => {
            const isLeft = idx === 0;
            const isRight = idx === 2;
            const textAlign = isLeft ? "left" : isRight ? "right" : "center";

            return (
              <View key={idx} style={s.labelItem}>
                <RemoteIcon uri={label.icon} style={s.icon} />
                <Text style={[s.label, { textAlign }]}>
                  {label.text}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);
HomeFooter.displayName = "HomeFooter";
