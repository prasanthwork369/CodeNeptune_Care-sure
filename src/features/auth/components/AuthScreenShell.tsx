import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { useAuthStore } from "@/src/store/authStore";
import { moderateScale, scale, verticalScale } from "@/src/utils/exactScale";
import { AuthMedicineBackground } from "./AuthMedicineBackground";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Animated as RNAnimated,
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardEvents } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AuthScreenShellProps {
  children?: React.ReactNode;
  onSkip?: () => void;
  footer?: React.ReactNode;
}

// Crash guard only — see backgroundStyle below.
const MIN_BACKGROUND_HEIGHT = verticalScale(80);

export const AuthScreenShell: React.FC<AuthScreenShellProps> = ({
  children,
  onSkip,
  footer,
}) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();
  const { width, height: screenHeight } = useWindowDimensions();
  const backgroundHeight = screenHeight * 0.6;
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  // Real-time native tracking (useReanimatedKeyboardAnimation) turned out to
  // report no movement at all in this app's setup — confirmed by removing
  // the correction layer and finding the panel didn't move whatsoever. So we
  // drive the animation ourselves: keyboardWillShow/Hide fire BEFORE the
  // native transition starts and report both the target height and the
  // native animation's own duration, so our withTiming runs concurrently
  // with — and matches the length of — the real keyboard transition.
  const kbHeight = useSharedValue(0);
  // Target height of the in-flight animation — kbHeight.value mid-animation
  // reads the interpolated value, so the "did" listeners compare against
  // this ref to know whether a correction is actually needed.
  const kbTarget = React.useRef(0);
  React.useEffect(() => {
    const animateTo = (height: number, duration: number) => {
      kbTarget.current = height;
      setKeyboardHeight(height);
      kbHeight.value = withTiming(height, {
        duration,
        easing: Easing.out(Easing.ease),
      });
    };
    const subs = [
      KeyboardEvents.addListener("keyboardWillShow", (e) =>
        animateTo(e.height, e.duration || 250),
      ),
      KeyboardEvents.addListener("keyboardWillHide", (e) =>
        animateTo(0, e.duration || 250),
      ),
      // Fallback + correction: some OEM keyboards (Samsung, MIUI/Poco) skip
      // the "will" events entirely, or settle taller than announced once
      // their accessory toolbar appears — without this the panel stays
      // pinned at the bottom and the keyboard covers the inputs.
      KeyboardEvents.addListener("keyboardDidShow", (e) => {
        if (Math.abs(kbTarget.current - e.height) > 1) animateTo(e.height, 120);
      }),
      KeyboardEvents.addListener("keyboardDidHide", () => {
        setKeyboardHeight(0);
        if (kbTarget.current !== 0) animateTo(0, 120);
      }),
    ];
    return () => subs.forEach((s) => s.remove());
  }, [kbHeight]);

  const stickyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.max(0, kbHeight.value - adjustedBottom) }],
  }));

  // Measured, not guessed: the sticky block's resting (pre-transform) top Y,
  // relative to `container` — which starts flush with this screen's own top,
  // so it's effectively the panel's resting Y on screen. A fixed height/floor
  // formula here can only match the panel's *actual* position by coincidence
  // (it did, briefly, at exactly one pair of magic numbers, and broke the
  // instant OTP's longer content or deeper keyboard offset shifted the
  // panel's real position without shifting the guess the same amount).
  // Bridged into a shared value via an effect (not mutated directly in the
  // onLayout handler) — React Compiler's immutability check only knows to
  // skip analyzing useEffect bodies, same as kbHeight above.
  const [panelRestY, setPanelRestY] = React.useState(backgroundHeight);
  const panelTopY = useSharedValue(backgroundHeight);
  React.useEffect(() => {
    panelTopY.value = panelRestY;
  }, [panelRestY, panelTopY]);
  const handleStickyLayout = (e: LayoutChangeEvent) => {
    setPanelRestY(e.nativeEvent.layout.y);
  };

  // Keep the medicine background's bottom fade attached to the form edge.
  // The form rises with the keyboard; without resizing this layer, the form
  // covers the fade and leaves a hard transition on both Login and OTP.
  // MIN_BACKGROUND_HEIGHT is only a crash guard for before the first
  // onLayout measurement lands (or a pathological content/keyboard
  // combination) — panelTopY is what actually drives this now.
  const backgroundStyle = useAnimatedStyle(() => ({
    height: Math.max(
      MIN_BACKGROUND_HEIGHT,
      panelTopY.value - Math.max(0, kbHeight.value - adjustedBottom),
    ),
  }));

  // iOS lifts by nearly the full keyboard, so the bottom inset would double as a gap.
  const footerPaddingBottom =
    Platform.OS === "ios" && keyboardHeight > 0
      ? verticalScale(16)
      : Math.max(insets.bottom, 16) + verticalScale(16);

  const isTablet = width >= 600;
  const panelMaxWidth = isTablet ? 560 : undefined;
  const panelPaddingH = isTablet ? Math.round(width * 0.08) : scale(32);
  const keyboardOffset = Math.max(0, keyboardHeight - adjustedBottom);
  const availableContentHeight = Math.max(
    0,
    screenHeight - keyboardOffset - insets.top - verticalScale(8),
  );

  const [skipScale] = React.useState(() => new RNAnimated.Value(1));

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    useAuthStore.getState().continueAsGuest();
    if (onSkip) {
      onSkip();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleSkipPressIn = () => {
    RNAnimated.spring(skipScale, {
      toValue: 0.93,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };
  const handleSkipPressOut = () => {
    RNAnimated.spring(skipScale, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.root}>
      {/* Background illustration — fixed behind everything */}
      <Animated.View style={[styles.bgWrapper, backgroundStyle]}>
        <AuthMedicineBackground />
      </Animated.View>

      {/* Skip button — fixed top-right */}
      <RNAnimated.View
        style={[
          styles.skipWrapper,
          {
            top:
              insets.top > 0
                ? insets.top + verticalScale(10)
                : verticalScale(53),
            right: width >= 390 ? scale(13) : scale(16),
          },
          { transform: [{ scale: skipScale }] },
        ]}
      >
        <Pressable
          style={styles.skipBtnOuter}
          accessibilityRole="button"
          accessibilityLabel="Skip"
          onPressIn={handleSkipPressIn}
          onPressOut={handleSkipPressOut}
          onPress={handleSkip}
        >
          <BlurView
            intensity={60}
            tint="systemChromeMaterialLight"
            blurMethod="none"
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
            <icons.arrow_forward_darkgreen width={6} height={11.08} />
          </BlurView>
        </Pressable>
      </RNAnimated.View>

      <View style={styles.container}>
        {/* Tap area above the sticky block — dismiss keyboard */}
        <Pressable onPress={Keyboard.dismiss} style={styles.dismissTapArea} />

        {/* Entire bottom block (panel + footer incl. policy links) rides as one unit, translating in sync with the keyboard */}
        <Animated.View
          style={[stickyStyle, { maxHeight: availableContentHeight }]}
          onLayout={handleStickyLayout}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.scrollContent}
          >
            {/* White panel */}
            <View
              style={[
                styles.panel,
                {
                  paddingHorizontal: panelPaddingH,
                  maxWidth: panelMaxWidth,
                  paddingBottom: footer
                    ? 0
                    : adjustedBottom + verticalScale(24),
                },
              ]}
            >
              {children}
            </View>

            {footer && (
              <View
                style={[
                  styles.footer,
                  {
                    paddingHorizontal: panelPaddingH,
                    paddingBottom: footerPaddingBottom,
                    maxWidth: panelMaxWidth,
                  },
                ]}
              >
                {footer}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "white",
  },
  bgWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  skipWrapper: {
    position: "absolute",
    zIndex: 50,
  },
  skipBtnOuter: {
    width: scale(70),
    height: verticalScale(30),
    borderRadius: scale(20),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#919EAB33",
  },
  skipBtn: {
    flex: 1,
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(4),
    paddingLeft: scale(10),
    paddingRight: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    borderColor: "#919EAB33",
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  skipText: {
    fontFamily: "Inter-700Bold",
    fontWeight: "700",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(17),
    letterSpacing: 0,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#0F7635",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dismissTapArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: "white",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    width: "100%",
    alignSelf: "center",
    paddingTop: verticalScale(32),
  },
  footer: {
    backgroundColor: "white",
    width: "100%",
    alignSelf: "center",
  },
});
