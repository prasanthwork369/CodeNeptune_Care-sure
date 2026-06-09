import { Skeleton } from "@/src/components/ui/Skeleton";
import { TextCycler } from "@/src/components/ui/TextCycler";
import { HOME_IMAGES } from "@/src/constants/images";
import { ApiHero } from "@/src/types/home";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Text, useWindowDimensions, View } from "react-native";
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

export const HeroBanner: React.FC<HeroBannerProps> = ({
  content,
  isLoading,
}) => {
  const { width } = useWindowDimensions();

  const bannerWidth = width - 32;
  const bannerHeight = Math.round(bannerWidth * 0.59);
  const calculatedHeight = bannerWidth * 0.48 * 1.2;
  const personHeight = Math.min(calculatedHeight, bannerWidth * 0.6);
  const personWidth = personHeight / 1.2;

  // Never shrink below mobile baseline; scale up gently on large screens
  const scale = Math.max(1, Math.sqrt(bannerWidth / 358));
  const titleFontSize = Math.min(Math.max(Math.round(21 * scale), 16), 26);
  const lineHeight = Math.round(titleFontSize * 1.34);
  const badgeFontSize = Math.min(Math.max(Math.round(13 * scale), 11), 16);
  const badgeIconSize = Math.min(Math.max(Math.round(16 * scale), 12), 20);
  const contentPaddingTop = Math.round(32 * scale);
  const badgeMarginTop = Math.round(20 * scale);
  const badgePaddingH = Math.round(12 * scale);
  const badgePaddingV = Math.round(6 * scale);
  const badgeGap = Math.round(10 * scale);
  const decor1Size = Math.round(28 * scale);
  const decor2Size = Math.round(24 * scale);

  // Hooks must be called before any early return
  const leftAnim = useSlideUp(200);
  const rightAnim = useSlideUp(400);
  const float1Anim = useFloat(600, 5);
  const float2Anim = useFloat(1100, 4);

  if (isLoading || !content) {
    return (
      <View
        style={{
          height: bannerHeight,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          backgroundColor: "#FAFAFA",
        }}
        className="mx-4 mt-5 overflow-hidden"
      >
        {/* Left: mirrors flex-[1.2] */}
        <View
          style={{
            paddingLeft: 20,
            paddingTop: contentPaddingTop,
            paddingRight: Math.round(personWidth * 0.82),
          }}
        >
          <Skeleton
            width="80%"
            height={lineHeight}
            borderRadius={8}
            style={{ marginBottom: 6 }}
          />
          <Skeleton
            width="65%"
            height={lineHeight}
            borderRadius={8}
            style={{ marginBottom: badgeMarginTop }}
          />
          <Skeleton
            width={Math.round(120 * scale)}
            height={Math.round(32 * scale)}
            borderRadius={999}
          />
        </View>

        {/* Right: person */}
        <View
          style={{
            position: "absolute",
            right: -10,
            bottom: -5,
            width: personWidth,
            height: personHeight,
          }}
        >
          <Skeleton
            width={personWidth}
            height={personHeight}
            borderRadius={16}
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
    <LinearGradient
      colors={["#CFE9A8", "#DEF0BF", "#ECF6D6", "#F6FBE8"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ borderWidth: 1, borderColor: "#00D1501A", height: bannerHeight }}
      className="mx-4 mt-5 rounded-[20px] overflow-hidden flex-row items-stretch"
    >
      {/* ── Right: Person image (rendered first so the text below always stacks above it) ── */}
      <Animated.View
        style={[
          {
            width: personWidth,
            height: personHeight,
            position: "absolute",
            right: -10,
            bottom: -5,
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

      {/* ── Left: Text block ── */}
      <Animated.View
        style={[leftAnim, { paddingRight: Math.round(personWidth * 0.82) }]}
        className="flex-[1.2] pl-3 pt-8 justify-start"
      >
        <View>
          <Text
            style={{ fontSize: titleFontSize, lineHeight }}
            className="font-inter-extrabold text-brand-text"
          >
            {title.replace("for your", "").trim()}
          </Text>

          <View className="flex-row items-center">
            <Text
              style={{
                fontSize: titleFontSize,
                lineHeight,
                includeFontPadding: false,
              }}
              className="font-inter-extrabold text-brand-text"
            >
              for your{" "}
            </Text>
            <TextCycler
              words={highlights}
              lineHeight={lineHeight}
              style={{ fontSize: titleFontSize }}
              className="font-inter-extrabold text-brand-primary"
            />
          </View>
        </View>

        {/* Pay less badge */}
        <View
          style={{
            shadowColor: "#919EAB33",
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
          className="flex-row items-center bg-white rounded-full px-3 py-1.5 mt-5 self-start gap-2.5"
        >
          {content.labelImage ? (
            <SvgUri
              uri={content.labelImage}
              width={badgeIconSize}
              height={badgeIconSize}
            />
          ) : null}
          <Text
            style={{ fontSize: badgeFontSize }}
            className="font-inter-semibold text-brand-primary"
          >
            {badgeText}
          </Text>
        </View>
      </Animated.View>

      {/* ── Background Decors (floating) ── */}
      <Animated.View
        style={[
          { position: "absolute", top: 30, right: personWidth - 50 },
          float1Anim,
        ]}
      >
        <Image
          source={HOME_IMAGES.bannerPills}
          style={{ width: decor1Size, height: decor1Size, opacity: 0.9 }}
          contentFit="contain"
        />
      </Animated.View>
      <Animated.View
        style={[
          { position: "absolute", bottom: 36, right: personWidth - 10 },
          float2Anim,
        ]}
      >
        <Image
          source={HOME_IMAGES.bannerMedicine}
          style={{ width: decor2Size, height: decor2Size, opacity: 0.8 }}
          contentFit="contain"
        />
      </Animated.View>
    </LinearGradient>
  );
};
