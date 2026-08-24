import { Skeleton } from "@/src/components/ui/Skeleton";
import { TextCycler } from "@/src/components/ui/TextCycler";
import { HOME_IMAGES } from "@/src/constants/images";
import { ApiHero } from "@/src/features/home/types";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { SvgUri } from "react-native-svg";
import { styles, getDynamicStyles } from "./HeroBanner.styles";

const ease = Easing.out(Easing.cubic);

// Shared with the skeleton so the hero never flashes grey to green.
const HERO_GRADIENT = ["#CFE9A8", "#DEF0BF", "#ECF6D6", "#F6FBE8"] as const;
const GRADIENT_START = { x: 0.5, y: 0 } as const;
const GRADIENT_END = { x: 0.5, y: 1 } as const;

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

interface HeroBannerProps {
  content?: ApiHero;
  isLoading?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = React.memo(
  ({ content, isLoading }) => {
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

    // FlashList's initial layout pass can tear down and remount the first
    // cell before it settles, cancelling this Image mid-load — and
    // expo-image never retries a cancelled/failed load on its own. Reload
    // once (bounded) on error so a cold-start hiccup doesn't leave the
    // avatar blank until the user pulls to refresh.
    //
    // Gated on avatarLoaded: expo-image can fire onError for a background
    // revalidation blip on a URL that already loaded and is still on
    // screen. Remounting (key bump) in that case would tear down a
    // perfectly good image and show blank — so only retry a load that
    // never succeeded in the first place.
    const [avatarReloadKey, setAvatarReloadKey] = useState(0);
    const avatarRetries = useRef(0);
    const avatarLoaded = useRef(false);
    const avatarUrl = content?.image;
    useEffect(() => {
      if (__DEV__) console.log("[HeroBanner] avatarUrl ->", avatarUrl);
      avatarRetries.current = 0;
      avatarLoaded.current = false;
    }, [avatarUrl]);
    useEffect(() => {
      if (!__DEV__) return;
      console.log("[HeroBanner] mounted");
      return () => console.log("[HeroBanner] unmounted");
    }, []);
    const handleAvatarLoad = () => {
      if (__DEV__) console.log("[HeroBanner] avatar onLoad", avatarUrl);
      avatarLoaded.current = true;
    };
    const handleAvatarError = () => {
      if (__DEV__)
        console.log(
          "[HeroBanner] avatar onError",
          avatarUrl,
          "alreadyLoaded:",
          avatarLoaded.current,
        );
      if (avatarLoaded.current) return;
      if (avatarRetries.current >= 2) return;
      avatarRetries.current += 1;
      setAvatarReloadKey((k) => k + 1);
    };

    // A system dialog (location/notification permission prompt) pauses and
    // resumes the host Activity — on some OEM skins the absolutely-positioned,
    // layered avatar Image doesn't get redrawn on resume even though nothing
    // in JS changed, leaving it blank with no error/data event to react to.
    // Force one remount on the first real resume after backgrounding.
    useEffect(() => {
      let skippedInitial = false;
      const sub = AppState.addEventListener("change", (state) => {
        if (state !== "active") return;
        if (!skippedInitial) {
          skippedInitial = true;
          return;
        }
        if (__DEV__) console.log("[HeroBanner] resumed — reloading avatar");
        setAvatarReloadKey((k) => k + 1);
      });
      return () => sub.remove();
    }, []);

    // Catches the case the mount/unmount log can't: HeroBanner itself stays
    // mounted but flips back to the skeleton branch, swapping the real
    // Image out for a shimmer placeholder — that looks like the avatar
    // "disappearing" with no unmount ever logged.
    if (__DEV__) {
      console.log("[HeroBanner] render branch ->", isLoading ? "skeleton" : !content ? "skeleton(no content)" : "loaded", "isLoading:", isLoading, "image:", content?.image);
    }

    if (isLoading || !content) {
      return (
        // Same container and geometry as the loaded card, so nothing shifts.
        <View style={[styles.container, dStyles.containerHeight]}>
          <LinearGradient
            colors={HERO_GRADIENT}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={styles.gradientCard}
            className="flex-row items-stretch"
          >
            <View
              style={dStyles.textBlock}
              className="flex-[1.2] justify-start"
            >
              <Skeleton
                width="72%"
                borderRadius={exactScale(5)}
                style={StyleSheet.flatten([
                  dStyles.skeletonLine1,
                  styles.skeletonPlaceholder,
                ])}
              />
              <Skeleton
                width="54%"
                borderRadius={exactScale(5)}
                style={StyleSheet.flatten([
                  dStyles.skeletonLine2,
                  styles.skeletonPlaceholder,
                ])}
              />
              <Skeleton
                borderRadius={exactScale(9999)}
                style={StyleSheet.flatten([
                  dStyles.skeletonBadge,
                  styles.skeletonPlaceholder,
                ])}
              />
            </View>
          </LinearGradient>

          {/* Person placeholder — inset within the real image's box so it hints
            at the figure instead of filling the card with a slab. */}
          <View
            style={[styles.avatar, dStyles.avatar, styles.skeletonAvatarBox]}
          >
            <Skeleton
              width="84%"
              height="88%"
              borderRadius={exactScale(16)}
              style={styles.skeletonAvatar}
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
          colors={HERO_GRADIENT}
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={styles.gradientCard}
          className="flex-row items-stretch"
        >
          {/* ── Left: Text block ── */}
          <Animated.View
            style={[leftAnim, dStyles.textBlock]}
            className="flex-[1.2] justify-start"
          >
            <View>
              <View
                className="flex-row flex-wrap items-center"
                style={{ minWidth: 0 }}
              >
                <Text
                  style={[styles.titleText, dStyles.titleText]}
                  className="text-brand-text"
                >
                  {title}
                  {title ? " " : ""}
                </Text>
                {highlights.length > 0 && (
                  <TextCycler
                    words={highlights}
                    lineHeight={dStyles.titleText.lineHeight}
                    style={StyleSheet.flatten([
                      styles.titleText,
                      dStyles.titleText,
                    ])}
                    className="text-brand-primary"
                  />
                )}
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
            key={avatarReloadKey}
            source={mainImage}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            contentPosition="bottom center"
            cachePolicy="memory-disk"
            onLoad={handleAvatarLoad}
            onError={handleAvatarError}
          />
        </Animated.View>

        {/* ── Background Decors (static) ── */}
        <View style={[styles.decorPills, dStyles.decorPills]}>
          <Image
            source={HOME_IMAGES.bannerPills}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        </View>
        <View style={[styles.decorMedicine, dStyles.decorMedicine]}>
          <Image
            source={HOME_IMAGES.bannerMedicine}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        </View>
      </View>
    );
  },
);
HeroBanner.displayName = "HeroBanner";
