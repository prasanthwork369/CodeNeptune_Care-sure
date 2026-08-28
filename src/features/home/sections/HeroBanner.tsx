import { Skeleton } from "@/src/components/ui/Skeleton";
import { TextCycler } from "@/src/components/ui/TextCycler";
import { HOME_IMAGES } from "@/src/constants/images";
import { ApiHero } from "@/src/features/home/types";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused } from "expo-router";
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
  runOnJS,
  useAnimatedReaction,
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

const debugLog = (...args: unknown[]) => {
  if (__DEV__) console.log(`[HeroBanner ${new Date().toISOString()}]`, ...args);
};

function useSlideUp(delayMs: number, debugLabel?: string) {
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

  useAnimatedReaction(
    () => ({ o: opacity.value, t: translateY.value }),
    (cur, prev) => {
      if (!__DEV__ || !debugLabel || !prev) return;
      if (cur.o !== prev.o || cur.t !== prev.t) {
        runOnJS(debugLog)(
          `anim[${debugLabel}] opacity ${prev.o.toFixed(2)}->${cur.o.toFixed(2)} translateY ${prev.t.toFixed(1)}->${cur.t.toFixed(1)}`,
        );
      }
    },
  );

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

interface HeroBannerProps {
  content?: ApiHero;
  isLoading?: boolean;
}

let heroInstanceCounter = 0;

export const HeroBanner: React.FC<HeroBannerProps> = React.memo(
  ({ content, isLoading }) => {
    const [instanceId] = useState(() => ++heroInstanceCounter);
    const isFocused = useIsFocused();
    const { width } = useWindowDimensions();

    const bannerWidth = width - exactScale(32);

    // Scale down on smaller devices (down to 0.8), but do not scale up on larger devices (cap at 1.0)
    const scale = Math.min(Math.max(0.8, bannerWidth / 358), 1.0);

    // Generate dynamic styles scaled precisely for the current device width
    const dStyles = getDynamicStyles(scale);

    const dynamicBadgeIconWidth = exactScale(16.6) * scale;
    const dynamicBadgeIconHeight = exactScale(20.5) * scale;

    const leftAnim = useSlideUp(200, "left");
    const rightAnim = useSlideUp(400, "avatar");

    const [avatarReloadKey, setAvatarReloadKey] = useState(0);
    const avatarRetries = useRef(0);
    const avatarLoaded = useRef(false);
    const avatarUrl = content?.image;
    useEffect(() => {
      debugLog(`#${instanceId} avatarUrl ->`, avatarUrl);
      avatarRetries.current = 0;
      avatarLoaded.current = false;
    }, [instanceId, avatarUrl]);
    useEffect(() => {
      debugLog(`#${instanceId} mounted`);
      return () => debugLog(`#${instanceId} unmounted`);
    }, [instanceId]);
    useEffect(() => {
      debugLog(`#${instanceId} route focus ->`, isFocused);
    }, [instanceId, isFocused]);
    const handleAvatarLoadStart = () => {
      debugLog(`#${instanceId} avatar onLoadStart`, avatarUrl, "key:", avatarReloadKey);
    };
    const handleAvatarLoad = () => {
      debugLog(`#${instanceId} avatar onLoad`, avatarUrl, "key:", avatarReloadKey);
      avatarLoaded.current = true;
    };
    const handleAvatarDisplay = () => {
      debugLog(`#${instanceId} avatar onDisplay`, avatarUrl, "key:", avatarReloadKey);
    };
    const handleAvatarError = () => {
      debugLog(
        `#${instanceId} avatar onError`,
        avatarUrl,
        "alreadyLoaded:",
        avatarLoaded.current,
        "key:",
        avatarReloadKey,
      );
      if (avatarLoaded.current) return;
      if (avatarRetries.current >= 2) return;
      avatarRetries.current += 1;
      setAvatarReloadKey((k) => k + 1);
    };

    useEffect(() => {
      let skippedInitial = false;
      const sub = AppState.addEventListener("change", (state) => {
        debugLog(`#${instanceId} AppState ->`, state, "avatarLoaded:", avatarLoaded.current);
        if (state !== "active") return;
        if (!skippedInitial) {
          skippedInitial = true;
          return;
        }
        if (avatarLoaded.current) {
          debugLog(`#${instanceId} resume ignored — avatar already loaded`);
          return;
        }
        debugLog(`#${instanceId} resumed — reloading avatar`);
        setAvatarReloadKey((k) => k + 1);
      });
      return () => sub.remove();
    }, [instanceId]);

    debugLog(
      `#${instanceId} render branch ->`,
      isLoading ? "skeleton" : !content ? "skeleton(no content)" : "loaded",
      "isLoading:",
      isLoading,
      "image:",
      content?.image,
      "key:",
      avatarReloadKey,
    );

    if (isLoading || !content) {
      return (
        <View style={[styles.container, dStyles.containerHeight]}>
          <LinearGradient
            colors={HERO_GRADIENT}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={[styles.gradientCard, { flexDirection: "row", alignItems: "stretch" }]}
          >
            <View
              style={[dStyles.textBlock, { flex: 1.2, justifyContent: "flex-start" }]}
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
    const subtitle = content.subtitle;
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
          style={[styles.gradientCard, { flexDirection: "row", alignItems: "stretch" }]}
        >
          {/* ── Left: Text block ── */}
          <Animated.View
            style={[leftAnim, dStyles.textBlock, { flex: 1.2, justifyContent: "flex-start" }]}
          >
            <View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  minWidth: 0,
                }}
              >
                <Text style={[styles.titleText, dStyles.titleText]}>
                  {title}
                  {title ? " " : ""}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {subtitle ? (
                    <Text style={[styles.titleText, dStyles.titleText]}>
                      {subtitle}{" "}
                    </Text>
                  ) : null}
                  {highlights.length > 0 && (
                    <TextCycler
                      words={highlights}
                      lineHeight={dStyles.titleText.lineHeight}
                      style={StyleSheet.flatten([
                        styles.titleText,
                        dStyles.titleText,
                        { color: "#0F7635" },
                      ])}
                    />
                  )}
                </View>
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

        {/* ── Right: Person image (positioned absolute) ── */}
        <Animated.View style={[styles.avatar, dStyles.avatar, rightAnim]}>
          <Image
            key={avatarReloadKey}
            source={mainImage}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            contentPosition="bottom center"
            cachePolicy="memory-disk"
            onLoadStart={handleAvatarLoadStart}
            onLoad={handleAvatarLoad}
            onDisplay={handleAvatarDisplay}
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
