/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps */
import { tabs } from "@/src/constants/data";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { useUIStore } from "@/src/store/uiStore";
import { useTabBarStore } from "@/src/store/useTabBarStore";
import { exactScale } from "@/src/utils/exactScale";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  DeviceEventEmitter,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import {
  ACTIVE_HEIGHT,
  ACTIVE_RADIUS,
  BAR_HEIGHT,
  FAB_WIDTH,
  ICON_SIZE,
  PILL_HEIGHT,
  styles as tabStyles,
  UPLOAD_ICON,
} from "./LiquidTabBar.styles";
import { TabBarFadeGradient } from "./TabBarFadeGradient";
import {
  ActivePillGlass,
  TabBarGlass,
  UploadButtonGlass,
} from "./TabBarGlass";

// Translucent so the glass backdrop reads through the active tab too
const ACTIVE_BG = "rgba(236,253,245,0.82)";
const ACTIVE_ICON_COLOR = colors.primary;
const INACTIVE_ICON_COLOR = "#6A6A6A";

// Snappy spring — feels instant like Blinkit
const SNAP_SPRING = { damping: 28, stiffness: 420, mass: 0.5 } as const;
// Slightly trailing spring for the liquid stretch effect
const TRAIL_SPRING = { damping: 22, stiffness: 320, mass: 0.6 } as const;
// How far the bar travels down to hide — also the range the gradient fades over
const TAB_BAR_HIDE_OFFSET = 120;
// Gentle spring for the upload button's icon/text slide transitions
const SLIDE_SPRING = { damping: 18, stiffness: 130, mass: 0.6 } as const;

// Row chrome flanking the pill container — lets tab width be derived instead of measured
const BAR_PADDING_LEFT = exactScale(12);
const BAR_MARGIN_RIGHT = exactScale(12);

const ICON_OFF_LEFT = -100;
const TEXT_OFF_RIGHT = 150;
const AUTO_EXPAND_DELAY = 500;
const HOLD_EXPANDED_MS = 2200;
const HOLD_COLLAPSED_MS = 1400;
// Attention cycles per reveal — looping forever kept the UI thread animating on every tab screen
const MAX_ATTENTION_CYCLES = 3;

const AnimatedText = Animated.createAnimatedComponent(Text);

const TAB_LABEL_MARGIN_TOP = exactScale(4);

// ─── Animated Upload Button ───────────────────────────────────────────────────

const AnimatedUploadButton = React.memo(
  ({ onPress }: { onPress: () => void }) => {
    const isUploadButtonCollapsed = useUIStore(
      (s) => s.isUploadButtonCollapsed,
    );
    const iconTranslate = useSharedValue(0);
    const textTranslate = useSharedValue(TEXT_OFF_RIGHT);

    const animateTo = useCallback((expand: boolean) => {
      if (expand) {
        iconTranslate.value = withSpring(ICON_OFF_LEFT, SLIDE_SPRING);
        textTranslate.value = withSpring(0, SLIDE_SPRING);
      } else {
        textTranslate.value = withSpring(TEXT_OFF_RIGHT, SLIDE_SPRING);
        iconTranslate.value = withSpring(0, SLIDE_SPRING);
      }
    }, []);

    // Width and label opacity now come straight off the tab bar's shared value
    // (see animatedButtonStyle), so they move on the same frame as the bar.
    // This effect only drives the periodic icon/text attention cycle.
    useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;
      let cycles = 0;

      const tick = (expand: boolean) => {
        if (isUploadButtonCollapsed) return;
        animateTo(expand);
        // Settle on the collapsed icon once the cycles are spent, so an idle screen animates nothing
        if (!expand && ++cycles >= MAX_ATTENTION_CYCLES) return;
        timeout = setTimeout(
          () => tick(!expand),
          expand ? HOLD_EXPANDED_MS : HOLD_COLLAPSED_MS,
        );
      };

      if (!isUploadButtonCollapsed) {
        timeout = setTimeout(() => tick(true), AUTO_EXPAND_DELAY);
      } else {
        iconTranslate.value = withSpring(0, SLIDE_SPRING);
        textTranslate.value = withSpring(TEXT_OFF_RIGHT, SLIDE_SPRING);
      }
      return () => clearTimeout(timeout);
    }, [isUploadButtonCollapsed]);

    const animatedButtonStyle = useAnimatedStyle(() => ({
      width: interpolate(
        tabBarVisible.value,
        [0, 1],
        [PILL_HEIGHT, FAB_WIDTH],
        Extrapolation.CLAMP,
      ),
      height: PILL_HEIGHT,
      borderTopLeftRadius: PILL_HEIGHT,
      borderBottomLeftRadius: PILL_HEIGHT,
      overflow: "hidden",
      backgroundColor: "transparent",
    }));

    const iconStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: iconTranslate.value }],
    }));

    // Fades over the back half of the bar's travel, so the label clears before the button narrows to a circle
    const labelStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: textTranslate.value }],
      opacity: interpolate(
        tabBarVisible.value,
        [0.5, 1],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    }));

    return (
      // Fixed box so the flex-row tab pill bar next to it never reflows as
      // this collapses/expands — only the shell below still resizes, and
      // that resize no longer touches anything outside this component.
      <View style={{ width: FAB_WIDTH, height: PILL_HEIGHT }}>
        <Pressable
          onPress={onPress}
          style={{ position: "absolute", right: 0, top: 0, bottom: 0 }}
        >
          <Animated.View style={animatedButtonStyle}>
            <LinearGradient
              colors={["#CB391C", "#F88004"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                width: "100%",
                height: "100%",
                borderTopLeftRadius: PILL_HEIGHT,
                borderBottomLeftRadius: PILL_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <UploadButtonGlass radius={PILL_HEIGHT} />
              <Animated.View style={[{ position: "absolute" }, iconStyle]}>
                <Image
                  source={HOME_IMAGES.upload_png}
                  style={{ width: UPLOAD_ICON, height: UPLOAD_ICON }}
                  resizeMode="contain"
                />
              </Animated.View>
              <Animated.View style={[{ position: "absolute" }, labelStyle]}>
                <Text style={tabStyles.uploadText}>Upload{"\n"}Prescription</Text>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </View>
    );
  },
);
AnimatedUploadButton.displayName = "AnimatedUploadButton";

// ─── Tab Item ─────────────────────────────────────────────────────────────────

type TabIconComponent = React.ComponentType<{
  color?: string;
  width?: number;
  height?: number;
}>;

function wrapIconWithAnimated(Icon: TabIconComponent) {
  return Animated.createAnimatedComponent(Icon);
}

// tabs is a small, fixed set known at module load, so every icon this tab bar
// can ever render is wrapped here once, up front — not inside TabItem. Any
// derivation performed during render (even a cached lookup) still trips
// react-hooks/static-components, since the linter can't prove it's cheap or
// stable; only a value that is already a plain prop by the time TabItem
// renders genuinely satisfies the rule.
const ANIMATED_TABS = tabs.map((tab) => ({
  ...tab,
  icon: wrapIconWithAnimated(tab.icon),
  activeIcon: tab.activeIcon ? wrapIconWithAnimated(tab.activeIcon) : undefined,
}));

type AnimatedTabIcon = ReturnType<typeof wrapIconWithAnimated>;

interface TabItemProps {
  icon: AnimatedTabIcon;
  activeIcon?: AnimatedTabIcon;
  index: number;
  label: string;
  // Single source of truth for "is this tab the active one" — set
  // synchronously on press (see tapGesture/panGesture below) and
  // re-synced from the confirmed route once navigation settles. Icon/label
  // color read this directly instead of the pill's own trailing position,
  // so they switch the instant a tab is pressed rather than lagging behind
  // (or briefly lighting up a tab the pill is only passing through).
  activeIndex: SharedValue<number>;
  followerX: SharedValue<number>;
  pillOpacity: SharedValue<number>;
}

const TabItem = React.memo(
  ({
    icon: Icon,
    activeIcon: ActiveIcon,
    index,
    label,
    activeIndex,
    followerX,
    pillOpacity,
  }: TabItemProps) => {
    const activeIconStyle = useAnimatedStyle(() => {
      "worklet";
      return {
        opacity: activeIndex.value === index ? pillOpacity.value : 0,
      };
    });

    const normalIconStyle = useAnimatedStyle(() => {
      "worklet";
      const a = activeIndex.value === index ? pillOpacity.value : 0;
      return { opacity: 1 - a, position: ActiveIcon ? "absolute" : "relative" };
    });

    // Purely cosmetic — the icon pulses as the pill's own trailing position
    // sweeps past it. Left tied to followerX; it doesn't gate the active
    // color/opacity above, so it can't cause the wrong tab to look selected.
    const zoomStyle = useAnimatedStyle(() => {
      "worklet";
      const dist = Math.abs(followerX.value - index);
      const scale = interpolate(dist, [0, 0.4], [1.1, 1], Extrapolation.CLAMP);
      return { transform: [{ scale: 1 + (scale - 1) * pillOpacity.value }] };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
      "worklet";
      const w = (activeIndex.value === index ? 1 : 0) * pillOpacity.value;
      return {
        color: interpolateColor(
          w,
          [0, 1],
          [INACTIVE_ICON_COLOR, ACTIVE_ICON_COLOR],
        ),
        // Bundled into the same worklet/source of truth as color so weight
        // and color always flip on the same frame instead of one trailing
        // the other.
        fontWeight: activeIndex.value === index ? "700" : "500",
        fontSize: tabStyles.tabLabel.fontSize,
        marginTop: TAB_LABEL_MARGIN_TOP,
        textAlign: "center",
        width: "100%",
      };
    });

    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: exactScale(6),
          paddingVertical: exactScale(8),
        }}
        className="h-full z-10"
      >
        <Animated.View
          style={[
            {
              alignItems: "center",
              justifyContent: "center",
              height: ICON_SIZE,
              width: ICON_SIZE,
            },
            zoomStyle,
          ]}
        >
          {ActiveIcon && (
            <Animated.View style={activeIconStyle}>
              <ActiveIcon
                width={ICON_SIZE}
                height={ICON_SIZE}
                color={ACTIVE_ICON_COLOR}
              />
            </Animated.View>
          )}
          <Animated.View style={normalIconStyle}>
            <Icon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={INACTIVE_ICON_COLOR}
            />
          </Animated.View>
        </Animated.View>
        <AnimatedText
          // fontFamily is intentionally omitted here — patchText.sanitizeStyle
          style={animatedTextStyle}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {label}
        </AnimatedText>
      </View>
    );
  },
);
TabItem.displayName = "TabItem";

// ─── Liquid Tab Bar ───────────────────────────────────────────────────────────

const LiquidTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const adjustedBottom = useAdjustedBottomInset();
  const extraGap = exactScale(6);
  const router = useNav();
  const setTabBarHeight = useTabBarStore((s) => s.setTabBarHeight);
  const { width: screenWidth } = useWindowDimensions();
  const activeRouteName = state.routes[state.index]?.name;
  // Without this, TabBarFadeGradient falls back to its own default
  // visibleHeight (~adjustedBottom + 4px) — nowhere near tall enough to back
  // the whole glass pill, so most of it has nothing solid behind it and
  // scrolled content shows straight through. Forcing it on gives every
  // screen, including Home, the full BAR_HEIGHT-tall opaque backdrop.
  const useFullHeightGradient = [
    "index",
    "categories",
    "profile",
    "upload",
  ].includes(activeRouteName);

  const pillRoutes = useMemo(
    () =>
      state.routes.filter((r) =>
        ["index", "categories", "profile"].includes(r.name),
      ),
    [state.routes],
  );

  const activePillIndex = useMemo(() => {
    const activeRoute = state.routes[state.index];
    return pillRoutes.findIndex((r) => r.name === activeRoute.name);
  }, [state.index, pillRoutes]);

  // Derived, not measured — onLayout would fire a setState on every frame of the collapse.
  // Upload button's flex-row footprint is now fixed at FAB_WIDTH (see
  // AnimatedUploadButton), so this no longer needs to track tabBarVisible.
  const tabWidthShared = useDerivedValue(() => {
    const inner = screenWidth - BAR_PADDING_LEFT - BAR_MARGIN_RIGHT - FAB_WIDTH;
    return inner / Math.max(1, pillRoutes.length);
  }, [screenWidth, pillRoutes.length]);

  // Only meaningful on mount: if the very first render already has the
  // upload tab active (activePillIndex === -1), the pill still needs a real
  // starting position instead of defaulting to 0. useSharedValue's initial
  // argument is discarded on every render after the first, so this doesn't
  // need to be tracked in a ref.
  const initialPillIndex = activePillIndex === -1 ? 0 : activePillIndex;
  const leaderX = useSharedValue(initialPillIndex);
  const followerX = useSharedValue(initialPillIndex);
  const pillOpacity = useSharedValue(activePillIndex === -1 ? 0 : 1);
  // Single source of truth for which tab's icon/label render as active.
  // Set instantly (no spring) inside the gesture worklets below so a press
  // shows its result on the same frame, before navigation has even
  // resolved. This effect is the fallback sync for everything that changes
  // the route WITHOUT going through those gestures — Android back, deep
  // links, a programmatic navigation call elsewhere in the app.
  const activeIndex = useSharedValue(initialPillIndex);

  useEffect(() => {
    if (activePillIndex !== -1) {
      activeIndex.value = activePillIndex;
      pillOpacity.value = withSpring(1, SNAP_SPRING);
      leaderX.value = withSpring(activePillIndex, SNAP_SPRING);
      followerX.value = withSpring(activePillIndex, TRAIL_SPRING);
    } else {
      pillOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [activePillIndex]);

  const navigateToTab = useCallback(
    (index: number) => {
      const route = pillRoutes[index];
      if (route) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (activePillIndex === index) {
          if (route.name === "index") {
            DeviceEventEmitter.emit("home-scroll-to-top");
          }
        } else {
          navigation.navigate(route.name);
        }
      }
    },
    [pillRoutes, navigation, activePillIndex],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-6, 6])
        .onUpdate((e) => {
          "worklet";
          const tw = tabWidthShared.value;
          if (tw <= 0) return;
          const clamped = Math.max(
            0,
            Math.min(pillRoutes.length - 1, e.x / tw),
          );
          leaderX.value = clamped;
          followerX.value = withSpring(clamped, TRAIL_SPRING);
          // Snap the active color to whichever tab is currently nearest the
          // finger, live — otherwise the icon/label sit frozen on the tab
          // the drag started from while the pill visually slides away from it.
          activeIndex.value = Math.round(clamped);
        })
        .onEnd(() => {
          "worklet";
          const final = Math.min(
            pillRoutes.length - 1,
            Math.max(0, Math.round(leaderX.value)),
          );
          // Instant, unanimated — the icon/label must show the result
          // immediately, not lag behind the pill's own trailing spring.
          activeIndex.value = final;
          leaderX.value = withSpring(final, SNAP_SPRING);
          followerX.value = withSpring(final, TRAIL_SPRING);
          runOnJS(navigateToTab)(final);
        }),
    [pillRoutes.length, navigateToTab],
  );

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(14)
        .onEnd((e) => {
          "worklet";
          const tw = tabWidthShared.value;
          if (tw <= 0) return;
          const final = Math.min(
            pillRoutes.length - 1,
            Math.max(0, Math.floor(e.x / tw)),
          );
          activeIndex.value = final;
          leaderX.value = withSpring(final, SNAP_SPRING);
          followerX.value = withSpring(final, TRAIL_SPRING);
          runOnJS(navigateToTab)(final);
        }),
    [pillRoutes.length, navigateToTab],
  );

  // Race: whichever gesture recognizes first wins — tap is instant, pan needs movement
  const gesture = useMemo(
    () => Gesture.Race(tapGesture, panGesture),
    [tapGesture, panGesture],
  );

  const animatedPillStyle = useAnimatedStyle(() => {
    "worklet";
    const tw = tabWidthShared.value;
    const gap = (PILL_HEIGHT - ACTIVE_HEIGHT) / 2;
    const start = Math.min(leaderX.value, followerX.value);
    const end = Math.max(leaderX.value, followerX.value);

    // Interpolate left offset: corner gap on leftmost tab, small padding on middle/right tabs
    const startOffset = interpolate(
      start,
      [0, 1, 2],
      [gap, 3, 3],
      Extrapolation.CLAMP,
    );

    // Interpolate right offset: small padding on left/middle tabs, corner gap on rightmost tab
    const endOffset = interpolate(
      end,
      [0, 1, 2],
      [3, 3, gap],
      Extrapolation.CLAMP,
    );

    const stretch = (end - start) * tw;

    return {
      transform: [
        { translateX: start * tw + startOffset },
        {
          scaleY: interpolate(stretch, [0, tw], [1, 0.94], Extrapolation.CLAMP),
        },
      ],
      width: tw - startOffset - endOffset + stretch,
      backgroundColor: ACTIVE_BG,
      opacity: pillOpacity.value,
    };
  });

  // Read straight off the shared value the scroll worklet writes, so the bar
  // moves on the same frame as the scroll — no store subscription, no re-render.
  const animatedTabBarContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          tabBarVisible.value,
          [0, 1],
          [TAB_BAR_HIDE_OFFSET, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));



  const tabItems = useMemo(
    () =>
      pillRoutes
        .map((route, index) => ({
          route,
          index,
          tab: ANIMATED_TABS.find((t) => t.name === route.name),
        }))
        .filter((item) => item.tab != null),
    [pillRoutes],
  );

  const handleUploadPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/upload");
  }, [router]);
  const handleLayout = useCallback(
    (e: LayoutChangeEvent) =>
      setTabBarHeight(e.nativeEvent.layout.height + 16 + 12),
    [setTabBarHeight],
  );

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row"
      style={{
        height: BAR_HEIGHT + adjustedBottom + extraGap,
        paddingBottom: adjustedBottom + extraGap,
        paddingLeft: BAR_PADDING_LEFT,
        alignItems: "flex-end",
      }}
      pointerEvents="box-none"
      onLayout={handleLayout}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, animatedTabBarContainerStyle]}
        pointerEvents="none"
      >
        <TabBarFadeGradient
          visibleHeight={
            useFullHeightGradient
              ? PILL_HEIGHT + adjustedBottom + extraGap
              : undefined
          }
        />
      </Animated.View>
      <Animated.View
        style={[{ flex: 1, height: PILL_HEIGHT }, animatedTabBarContainerStyle]}
        pointerEvents="box-none"
      >
        {/* Shadow lives on this outer view -- a sibling view with overflow:hidden would
            clip its own shadow, so the rounded-corner clipping happens one level in.
            boxShadow is used here instead of shadowColor/elevation because Android's
            elevation only ever renders a directional drop shadow -- it can't produce
            the even, all-around glow box-shadow: 0px 0px 20px 0px #00000026 calls for. */}
        <View
          style={{
            flex: 1,
            marginRight: BAR_MARGIN_RIGHT,
            height: PILL_HEIGHT,
            borderRadius: PILL_HEIGHT / 2,
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 0px 20px 0px #00000014",
          }}
        >
          <GestureDetector gesture={gesture}>
            <View
              style={{
                height: PILL_HEIGHT,
                borderRadius: PILL_HEIGHT / 2,
                overflow: "hidden",
              }}
              className="flex-1 flex-row items-center"
            >
              <TabBarGlass radius={PILL_HEIGHT / 2} />
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: PILL_HEIGHT / 2,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={[
                    animatedPillStyle,
                    {
                      position: "absolute",
                      height: ACTIVE_HEIGHT,
                      borderRadius: ACTIVE_RADIUS,
                      top: (PILL_HEIGHT - ACTIVE_HEIGHT) / 2,
                      overflow: "hidden",
                    },
                  ]}
                >
                  <ActivePillGlass radius={ACTIVE_RADIUS} />
                </Animated.View>
              </View>
              {tabItems.map(({ route, index, tab }) => (
                <TabItem
                  key={route.key}
                  index={index}
                  activeIndex={activeIndex}
                  icon={tab!.icon}
                  activeIcon={tab!.activeIcon}
                  label={tab!.title}
                  followerX={followerX}
                  pillOpacity={pillOpacity}
                />
              ))}
            </View>
          </GestureDetector>
        </View>
      </Animated.View>

      <AnimatedUploadButton onPress={handleUploadPress} />
    </View>
  );
};

export default LiquidTabBar;
