import { Skeleton } from "@/src/components/ui/Skeleton";
import { TextCycler } from "@/src/components/ui/TextCycler";
import { HOME_IMAGES } from "@/src/constants/images";
import { ApiHero } from "@/src/types/home";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SvgUri } from "react-native-svg";
import { styles } from "./HeroBanner.styles";

const ease = Easing.out(Easing.cubic);

function useSlideUp(delayMs: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(22);

  useEffect(() => {
    opacity.value = withDelay(
      delayMs,
      withTiming(1, { duration: 520, easing: ease }),
    );
    translateY.value = withDelay(
      delayMs,
      withTiming(0, { duration: 520, easing: ease }),
    );
  }, []);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

function useFloat(delayMs: number, amplitude = 5) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-amplitude, {
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
}

interface HeroBannerProps {
  content?: ApiHero;
  isLoading?: boolean;
}

// Trims title to "Stop overpaying" (removes "for your" and cycling words)
const getCleanTitlePart1 = (rawTitle?: string): string => {
  if (!rawTitle) return "Stop overpaying";
  const lowercaseTitle = rawTitle.toLowerCase();
  const forYourIndex = lowercaseTitle.indexOf("for your");
  if (forYourIndex !== -1) {
    return rawTitle.substring(0, forYourIndex).trim();
  }
  return "Stop overpaying";
};

export const HeroBanner: React.FC<HeroBannerProps> = ({
  content,
  isLoading,
}) => {
  const { width } = useWindowDimensions();

  const bannerWidth = width - 32;

  // Scale down on smaller devices (down to 0.8), but do not scale up on larger devices (cap at 1.0)
  const scale = Math.min(Math.max(0.8, bannerWidth / 358), 1.0);

  // Dynamically calculate the avatar size and text properties
  const dynamicAvatarWidth = Math.round(styles.avatar.width * scale);
  const dynamicAvatarHeight = Math.round(styles.avatar.height * scale);
  const dynamicAvatarTop = Math.round(styles.avatar.top * scale);
  const personWidth = dynamicAvatarWidth;

  const dynamicFontSize = Math.round(20 * scale);
  const dynamicLineHeight = Math.round(30 * scale);

  // Dynamically calculate badge dimensions and text styling
  const dynamicBadgeWidth = Math.round(160 * scale);
  const dynamicBadgeHeight = Math.round(30 * scale);
  const dynamicBadgeMarginTop = Math.round(10 * scale);
  const dynamicBadgeIconWidth = Math.round(16.6 * scale);
  const dynamicBadgeIconHeight = Math.round(20.5 * scale);
  const dynamicBadgeFontSize = Math.round(12 * scale);
  const dynamicBadgeLineHeight = Math.round(12 * scale);

  const lineHeight = Math.round(
    Math.min(Math.max(Math.round(21 * scale), 16), 26) * 1.34,
  );
  const contentPaddingTop = Math.round(32 * scale);
  const badgeMarginTop = Math.round(20 * scale);

  // Hooks must be called before any early return
  const leftAnim = useSlideUp(200);
  const rightAnim = useSlideUp(400);
  const float1Anim = useFloat(600, 5);
  const float2Anim = useFloat(1100, 4);

  if (isLoading || !content) {
    return (
      <View style={styles.skeletonContainer}>
        {/* Left: mirrors flex-[1.2] */}
        <View
          style={{
            paddingLeft: exactScale(10),
            paddingTop: contentPaddingTop,
            paddingRight: Math.round(personWidth * 0.4),
          }}
        >
          <Skeleton
            width="80%"
            height={lineHeight}
            borderRadius={exactScale(8)}
            style={{ marginBottom: exactScale(6) }}
          />
          <Skeleton
            width="65%"
            height={lineHeight}
            borderRadius={exactScale(8)}
            style={{ marginBottom: badgeMarginTop }}
          />
          <Skeleton
            width={Math.round(120 * scale)}
            height={Math.round(32 * scale)}
            borderRadius={exactScale(999)}
          />
        </View>

        {/* Right: person */}
        <View
          style={[
            styles.avatar,
            {
              width: dynamicAvatarWidth,
              height: dynamicAvatarHeight,
              top: dynamicAvatarTop,
            },
          ]}
        >
          <Skeleton
            width={dynamicAvatarWidth}
            height={dynamicAvatarHeight}
            borderRadius={exactScale(16)}
          />
        </View>
      </View>
    );
  }

  const title = content.title;
  const badgeText = content.status_text;
  const mainImage = { uri: content.image };
  const highlights = content.highlighted_text ?? [];

  return (
    <View style={styles.container}>
      {/* Background Gradient Card */}
      <LinearGradient
        colors={["#CFE9A8", "#DEF0BF", "#ECF6D6", "#F6FBE8"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, borderRadius: exactScale(12), overflow: "hidden" }}
        className="flex-row items-stretch"
      >
        {/* ── Left: Text block ── */}
        <Animated.View
          style={[leftAnim, { paddingRight: Math.round(personWidth * 0.6) }]}
          className="flex-[1.2] pl-3 pt-6 justify-start"
        >
          <View>
            {/* First line (e.g. 'Stop overpaying') */}
            <Text
              style={[
                styles.titleText,
                { fontSize: dynamicFontSize, lineHeight: dynamicLineHeight },
              ]}
              className="text-brand-text"
              allowFontScaling={false}
            >
              {getCleanTitlePart1(title)}
            </Text>

            {/* Second line (inline 'for your' prefix and cycling word cycler) */}
            <View className="flex-row items-center" style={{ minWidth: 0 }}>
              <Text
                style={[
                  styles.titleText,
                  {
                    flexShrink: 0,
                    fontSize: dynamicFontSize,
                    lineHeight: dynamicLineHeight,
                  },
                ]}
                className="text-brand-text"
                allowFontScaling={false}
              >
                for your{" "}
              </Text>
              <TextCycler
                words={highlights}
                lineHeight={dynamicLineHeight}
                style={StyleSheet.flatten([
                  styles.titleText,
                  { fontSize: dynamicFontSize, lineHeight: dynamicLineHeight },
                ])}
                className="text-brand-primary"
              />
            </View>
          </View>

          {/* Pay less badge */}
          <View
            style={[
              styles.badgeContainer,
              {
                width: dynamicBadgeWidth,
                height: dynamicBadgeHeight,
                marginTop: dynamicBadgeMarginTop,
                paddingLeft: Math.round(7 * scale),
                paddingRight: Math.round(7 * scale),
                gap: Math.round(6 * scale),
              },
            ]}
          >
            {content.labelImage ? (
              <SvgUri
                uri={content.labelImage}
                width={dynamicBadgeIconWidth}
                height={dynamicBadgeIconHeight}
              />
            ) : null}
            <Text
              style={[
                styles.badgeText,
                {
                  fontSize: dynamicBadgeFontSize,
                  lineHeight: dynamicBadgeLineHeight,
                },
              ]}
              allowFontScaling={false}
            >
              {badgeText}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── Right: Person image (positioned absolute, sibling to allow overflow) ── */}
      <Animated.View
        style={[
          styles.avatar,
          {
            width: dynamicAvatarWidth,
            height: dynamicAvatarHeight,
            top: dynamicAvatarTop,
          },
          rightAnim,
        ]}
      >
        <Image
          source={mainImage}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          contentPosition="bottom center"
        />
      </Animated.View>

      {/* ── Background Decors (floating) ── */}
      <Animated.View style={[styles.decorPills, float1Anim]}>
        <Image
          source={HOME_IMAGES.bannerPills}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.decorMedicine, float2Anim]}>
        <Image
          source={HOME_IMAGES.bannerMedicine}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
};
