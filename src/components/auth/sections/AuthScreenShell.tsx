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
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { KeyboardEvents } from "react-native-keyboard-controller";
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
  const panelPaddingH = isTablet ? Math.round(width * 0.08) : 32;
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Background illustration — fixed behind everything */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: backgroundHeight,
          zIndex: 0,
        }}
      >
        <AuthMedicineBackground />
      </View>

      {/* Skip button — fixed top-right */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: Math.max(insets.top, 20) + 20,
            right: 24,
            zIndex: 50,
          },
          skipStyle,
        ]}
      >
        <Pressable
          className="bg-white px-4 py-2 rounded-full flex-row items-center border border-brand-border"
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
          <Text className="text-brand-primary font-inter-medium mr-1 leading-none">
            Skip
          </Text>
          <icons.arrow_forward_green width={12} height={12} />
        </Pressable>
      </Animated.View>

      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {/* Tap area above the sticky block — dismiss keyboard */}
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }} />

        {/* Entire bottom block (panel + footer incl. policy links) rides as one unit, translating in sync with the keyboard */}
        <Animated.View style={stickyStyle}>
          {/* White panel */}
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: panelPaddingH,
              maxWidth: panelMaxWidth,
              width: "100%",
              alignSelf: "center",
              paddingTop: 32,
              paddingBottom: footer ? 0 : adjustedBottom + 24,
            }}
          >
            {children}
          </View>

          {footer && (
            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: panelPaddingH,
                paddingBottom: adjustedBottom + 16,
                maxWidth: panelMaxWidth,
                width: "100%",
                alignSelf: "center",
              }}
            >
              {footer}
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};
