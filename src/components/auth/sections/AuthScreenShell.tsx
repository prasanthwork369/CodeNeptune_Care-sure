import { AuthMedicineBackground } from "@/src/components/auth/AuthMedicineBackground";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useAuthStore } from "@/src/store/authStore";
import * as Haptics from "expo-haptics";
import React from "react";
import {
    Dimensions,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { KeyboardEvents } from "react-native-keyboard-controller";
import { moderateScale } from "react-native-size-matters";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";

interface AuthScreenShellProps {
  children?: React.ReactNode;
  onSkip?: () => void;
  footer?: React.ReactNode;
}

export const AuthScreenShell: React.FC<AuthScreenShellProps> = ({
  children,
  onSkip,
  footer,
}) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();
  const { width } = useWindowDimensions();

  // Captured once (non-reactive) so a stray native window resize never
  // shrinks our root layout and double-stacks with the keyboard offset below.
  const [screenHeight] = React.useState(() => Dimensions.get("window").height);
  const [backgroundHeight] = React.useState(() => screenHeight * 0.6);

  // Real-time native tracking (useReanimatedKeyboardAnimation) turned out to
  // report no movement at all in this app's setup — confirmed by removing
  // the correction layer and finding the panel didn't move whatsoever. So we
  // drive the animation ourselves: keyboardWillShow/Hide fire BEFORE the
  // native transition starts and report both the target height and the
  // native animation's own duration, so our withTiming runs concurrently
  // with — and matches the length of — the real keyboard transition.
  const kbHeight = useSharedValue(0);
  React.useEffect(() => {
    const showSub = KeyboardEvents.addListener("keyboardWillShow", (e) => {
      kbHeight.value = withTiming(e.height, {
        duration: e.duration || 250,
        easing: Easing.out(Easing.ease),
      });
    });
    const hideSub = KeyboardEvents.addListener("keyboardWillHide", (e) => {
      kbHeight.value = withTiming(0, {
        duration: e.duration || 250,
        easing: Easing.out(Easing.ease),
      });
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [kbHeight]);

  const stickyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.max(0, kbHeight.value - adjustedBottom) }],
  }));

  const isTablet = width >= 600;
  const panelMaxWidth = isTablet ? 560 : undefined;
  const panelPaddingH = isTablet ? Math.round(width * 0.08) : moderateScale(32, 0.3);
  const skipScale = useSharedValue(1);
  const skipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
  }));

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    useAuthStore.getState().continueAsGuest();
    onSkip ? onSkip() : router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      {/* Background illustration — fixed behind everything */}
      <View
        style={[
          styles.bgWrapper,
          {
            height: backgroundHeight,
          },
        ]}
      >
        <AuthMedicineBackground />
      </View>

      {/* Skip button — fixed top-right */}
      <Animated.View
        style={[
          styles.skipWrapper,
          {
            top: insets.top > 0 ? insets.top + moderateScale(10, 0.3) : moderateScale(53, 0.3),
            right: width >= 390 ? moderateScale(13, 0.3) : moderateScale(16, 0.3),
          },
          skipStyle,
        ]}
      >
        <Pressable
          style={styles.skipBtn}
          accessibilityRole="button"
          accessibilityLabel="Skip"
          onPressIn={() => {
            skipScale.value = withSpring(0.93, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            skipScale.value = withSpring(1, { damping: 15, stiffness: 300 });
          }}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>
            Skip
          </Text>
          <icons.arrow_forward_green width={6.09} height={11.08} />
        </Pressable>
      </Animated.View>

      <View style={styles.container}>
        {/* Tap area above the sticky block — dismiss keyboard */}
        <Pressable onPress={Keyboard.dismiss} style={styles.dismissTapArea} />

        {/* Entire bottom block (panel + footer incl. policy links) rides as one unit, translating in sync with the keyboard */}
        <Animated.View style={stickyStyle}>
          {/* White panel */}
          <View
            style={[
              styles.panel,
              {
                paddingHorizontal: panelPaddingH,
                maxWidth: panelMaxWidth,
                paddingBottom: footer ? 0 : adjustedBottom + moderateScale(24, 0.3),
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
                  paddingBottom: adjustedBottom + moderateScale(16, 0.3),
                  maxWidth: panelMaxWidth,
                },
              ]}
            >
              {footer}
            </View>
          )}
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
  skipBtn: {
    width: moderateScale(70, 0.3),
    height: moderateScale(30, 0.3),
    borderWidth: 1,
    borderColor: "#919EAB33",
    borderRadius: moderateScale(20, 0.3),
    backgroundColor: "#FFFFFF",
    paddingTop: moderateScale(6, 0.3),
    paddingBottom: moderateScale(6, 0.3),
    paddingLeft: moderateScale(10, 0.3),
    paddingRight: moderateScale(10, 0.3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8, 0.3),
  },
  skipText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: moderateScale(12, 0.1),
    lineHeight: moderateScale(12, 0.1),
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
  panel: {
    backgroundColor: "white",
    borderTopLeftRadius: moderateScale(24, 0.3),
    borderTopRightRadius: moderateScale(24, 0.3),
    width: "100%",
    alignSelf: "center",
    paddingTop: moderateScale(32, 0.3),
  },
  footer: {
    backgroundColor: "white",
    width: "100%",
    alignSelf: "center",
  },
});
