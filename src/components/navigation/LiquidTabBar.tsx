import { tabs } from "@/src/constants/data";
import { HOME_IMAGES } from "@/src/constants/images";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { useUIStore } from "@/src/store/uiStore";
import { useTabBarStore } from "@/src/store/useTabBarStore";
import { exactScale } from "@/src/utils/exactScale";
import * as Haptics from "expo-haptics";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  DeviceEventEmitter,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
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
  withSequence,
  withSpring,
  withTiming,
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
  GLASS_TINT,
  TabBarGlass,
  UploadButtonGlass,
} from "./TabBarGlass";

// Translucent so the glass backdrop reads through the active tab too
const ACTIVE_BG = "rgba(236,253,245,0.82)";
const ACTIVE_ICON_COLOR = "#0F7635";
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
      <Pressable onPress={onPress} style={{ height: PILL_HEIGHT }}>
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
    );
  },
);
AnimatedUploadButton.displayName = "AnimatedUploadButton";

// ─── Tab Item ─────────────────────────────────────────────────────────────────

interface TabItemProps {
  icon: React.ComponentType<{
    color?: string;
    width?: number;
    height?: number;
  }>;
  activeIcon?: React.ComponentType<{
    color?: string;
    width?: number;
    height?: number;
  }>;
  index: number;
  label: string;
  followerX: SharedValue<number>;
  pillOpacity: SharedValue<number>;
}

const TabItem = React.memo(
  ({
    icon: Icon,
    activeIcon: ActiveIcon,
    index,
    label,
    followerX,
    pillOpacity,
  }: TabItemProps) => {
    const AnimatedIcon = useMemo(
      () => Animated.createAnimatedComponent(Icon),
      [Icon],
    );
    const AnimatedActiveIcon = useMemo(
      () => (ActiveIcon ? Animated.createAnimatedComponent(ActiveIcon) : null),
      [ActiveIcon],
    );

    const activeIconStyle = useAnimatedStyle(() => {
      "worklet";
      const dist = Math.abs(followerX.value - index);
      return {
        opacity:
          dist < 0.3
            ? interpolate(dist, [0, 0.2], [1, 0], Extrapolation.CLAMP) *
              pillOpacity.value
            : 0,
      };
    });

    const normalIconStyle = useAnimatedStyle(() => {
      "worklet";
      const dist = Math.abs(followerX.value - index);
      const a =
        dist < 0.3
          ? interpolate(dist, [0, 0.2], [1, 0], Extrapolation.CLAMP) *
            pillOpacity.value
          : 0;
      return { opacity: 1 - a, position: ActiveIcon ? "absolute" : "relative" };
    });

    const zoomStyle = useAnimatedStyle(() => {
      "worklet";
      const dist = Math.abs(followerX.value - index);
      const scale = interpolate(dist, [0, 0.4], [1.1, 1], Extrapolation.CLAMP);
      return { transform: [{ scale: 1 + (scale - 1) * pillOpacity.value }] };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
      "worklet";
      const dist = Math.abs(followerX.value - index);
      const w =
        interpolate(dist, [0, 0.2], [1, 0], Extrapolation.CLAMP) *
        pillOpacity.value;
      return {
        color: interpolateColor(
          w,
          [0, 1],
          [INACTIVE_ICON_COLOR, ACTIVE_ICON_COLOR],
        ),
        fontSize: tabStyles.tabLabel.fontSize,
        // This style is written straight to the native view from the UI thread, bypassing
        // the global Text patch (src/utils/patchText.ts) -- so unlike everywhere else in the
        // app, the real loaded font name must be set here directly instead of a numeric
        // fontWeight. iOS keeps numeric fontWeight since SF Pro honors it natively.
        fontFamily:
          Platform.OS === "android"
            ? w > 0.5
              ? "Inter_700Bold"
              : "Inter_500Medium"
            : undefined,
        fontWeight:
          Platform.OS === "android" ? "normal" : w > 0.5 ? "700" : "500",
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
          {AnimatedActiveIcon && (
            <Animated.View style={activeIconStyle}>
              <AnimatedActiveIcon
                width={ICON_SIZE}
                height={ICON_SIZE}
                color={ACTIVE_ICON_COLOR}
              />
            </Animated.View>
          )}
          <Animated.View style={normalIconStyle}>
            <AnimatedIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={INACTIVE_ICON_COLOR}
            />
          </Animated.View>
        </Animated.View>
        <AnimatedText
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
  // Only Home writes to the shared tabBarVisible value (via its scroll
  // handler). Every other screen that doesn't drive it itself needs to force
  // the gradient on here, or it inherits whatever hidden/faded state Home
  // last left behind instead of always showing on open.
  const keepBottomGradient = ["categories", "profile", "upload"].includes(
    activeRouteName,
  );

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

  const lastValidIndex = useRef(activePillIndex === -1 ? 0 : activePillIndex);
  if (activePillIndex !== -1) lastValidIndex.current = activePillIndex;

  // Derived, not measured — onLayout would fire a setState on every frame of the collapse
  const tabWidthShared = useDerivedValue(() => {
    const uploadWidth = interpolate(
      tabBarVisible.value,
      [0, 1],
      [PILL_HEIGHT, FAB_WIDTH],
      Extrapolation.CLAMP,
    );
    const inner =
      screenWidth - BAR_PADDING_LEFT - BAR_MARGIN_RIGHT - uploadWidth;
    return inner / Math.max(1, pillRoutes.length);
  }, [screenWidth, pillRoutes.length]);

  const leaderX = useSharedValue(lastValidIndex.current);
  const followerX = useSharedValue(lastValidIndex.current);
  const pillOpacity = useSharedValue(activePillIndex === -1 ? 0 : 1);

  // Android: the active tab label's custom Inter typeface (set via useAnimatedStyle in
  // TabItem) can fail to resolve on the very first paint -- the native Text view is
  // created before the font is queryable in Android's typeface cache, and only a real
  // prop update (like tapping a tab) re-resolves it correctly. Setting followerX to the
  // same value it already holds is a no-op (Reanimated skips pushing an update when the
  // value doesn't change), so we animate it away and back over real frames -- after a
  // short delay for the typeface cache to warm up -- which forces genuine native style
  // recomputes and lets the active label land on the bold weight without needing a tap.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const id = setTimeout(() => {
      followerX.value = withSequence(
        withTiming(lastValidIndex.current + 0.01, { duration: 16 }),
        withTiming(lastValidIndex.current, { duration: 16 }),
      );
    }, 80);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (activePillIndex !== -1) {
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
        })
        .onEnd(() => {
          "worklet";
          const final = Math.min(
            pillRoutes.length - 1,
            Math.max(0, Math.round(leaderX.value)),
          );
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

  // The fade gradient is anchored to the screen bottom, so sliding it would
  // push its solid end off-screen and collapse the fade band into a hard edge.
  // It dissolves in place instead, finishing exactly as the pill lands.
  const animatedGradientStyle = useAnimatedStyle(() => ({
    opacity: tabBarVisible.value,
  }));

  const tabItems = useMemo(
    () =>
      pillRoutes
        .map((route, index) => ({
          route,
          index,
          tab: tabs.find((t) => t.name === route.name),
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
        style={[
          StyleSheet.absoluteFill,
          keepBottomGradient ? undefined : animatedGradientStyle,
        ]}
        pointerEvents="none"
      >
        <TabBarFadeGradient
          visibleHeight={
            keepBottomGradient
              ? BAR_HEIGHT + adjustedBottom + extraGap
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
            backgroundColor: GLASS_TINT,
            boxShadow: "0px 0px 20px 0px #00000026",
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
