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
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SvgUri } from "react-native-svg";
import { styles, getDynamicStyles } from "./HeroBanner.styles";

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
  }, [delayMs, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

function useFloat(delayMs: number, amplitude = 5, enabled = true) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (!enabled) {
      cancelAnimation(translateY);
      translateY.value = withTiming(0, {
        duration: 180,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

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
    return () => cancelAnimation(translateY);
  }, [amplitude, delayMs, enabled, translateY]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
}

interface HeroBannerProps {
  content?: ApiHero;
  isLoading?: boolean;
  motionEnabled?: boolean;
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
  motionEnabled = true,
}) => {
  const { width } = useWindowDimensions();

  const bannerWidth = width - exactScale(32);

  // Scale down on smaller devices (down to 0.8), but do not scale up on larger devices (cap at 1.0)
  const scale = Math.min(Math.max(0.8, bannerWidth / 358), 1.0);

  // Generate dynamic styles scaled precisely for the current device width
  const dStyles = getDynamicStyles(scale);

  const dynamicBadgeIconWidth = exactScale(16.6) * scale;
  const dynamicBadgeIconHeight = exactScale(20.5) * scale;

  // Hooks must be called before any early return
  const leftAnim = useSlideUp(200);
  const rightAnim = useSlideUp(400);
  const float1Anim = useFloat(600, 5, motionEnabled);
  const float2Anim = useFloat(1100, 4, motionEnabled);

  if (isLoading || !content) {
    return (
      <View style={[styles.skeletonContainer, dStyles.containerHeight]}>
        {/* Left: mirrors flex-[1.2] */}
        <View style={dStyles.skeletonTextBlock}>
          <Skeleton
            width="80%"
            borderRadius={exactScale(8)}
            style={dStyles.skeletonLine1}
          />
          <Skeleton
            width="65%"
            borderRadius={exactScale(8)}
            style={dStyles.skeletonLine2}
          />
          <Skeleton
            borderRadius={exactScale(999)}
            style={dStyles.skeletonBadge}
          />
        </View>

        {/* Right: person */}
        <View style={[styles.avatar, dStyles.avatar]}>
          <Skeleton
            width={dStyles.avatar.width}
            height={dStyles.avatar.height}
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
    <View style={[styles.container, dStyles.containerHeight]}>
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
          style={[leftAnim, dStyles.textBlock]}
          className="flex-[1.2] justify-start"
        >
          <View>
            {/* First line (e.g. 'Stop overpaying') */}
            <Text
              style={[styles.titleText, dStyles.titleText]}
              className="text-brand-text"
            >
              {getCleanTitlePart1(title)}
            </Text>

            {/* Second line (inline 'for your' prefix and cycling word cycler) */}
            <View className="flex-row items-center" style={{ minWidth: 0 }}>
              <Text
                style={[
                  styles.titleText,
                  dStyles.titleText,
                  { flexShrink: 0 },
                ]}
                className="text-brand-text"
              >
                for your{" "}
              </Text>
              <TextCycler
                words={highlights}
                lineHeight={dStyles.titleText.lineHeight}
                style={StyleSheet.flatten([
                  styles.titleText,
                  dStyles.titleText,
                ])}
                className="text-brand-primary"
              />
            </View>
          </View>

          {/* Pay less badge */}
          <View style={[styles.badgeContainer, dStyles.badgeContainer]}>
            {content.labelImage ? (
              <SvgUri
                uri={content.labelImage}
                width={dynamicBadgeIconWidth}
                height={dynamicBadgeIconHeight}
              />
            ) : null}
            <Text style={[styles.badgeText, dStyles.badgeText]}>
              {badgeText}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── Right: Person image (positioned absolute, sibling to allow overflow) ── */}
      <Animated.View style={[styles.avatar, dStyles.avatar, rightAnim]}>
        <Image
          source={mainImage}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          contentPosition="bottom center"
        />
      </Animated.View>

      {/* ── Background Decors (floating) ── */}
      <Animated.View style={[styles.decorPills, dStyles.decorPills, float1Anim]}>
        <Image
          source={HOME_IMAGES.bannerPills}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </Animated.View>
      <Animated.View style={[styles.decorMedicine, dStyles.decorMedicine, float2Anim]}>
        <Image
          source={HOME_IMAGES.bannerMedicine}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
};
