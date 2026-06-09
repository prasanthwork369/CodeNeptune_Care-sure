import { icons } from "@/src/constants/icons";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useEffect } from "react";
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BaseBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxHeightPercent?: number;
  borderRadius?: number;
  px?: number;
  pt?: number;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
}

export const BaseBottomSheet: React.FC<BaseBottomSheetProps> = ({
  isVisible,
  onClose,
  children,
  showCloseButton = true,
  maxHeightPercent = 90,
  borderRadius = 28,
  px = 20,
  pt = 24,
  keyboardAvoiding = false,
  backgroundColor = "#FFFFFF",
}) => {
  const screenHeight = Dimensions.get('screen').height;
  const insets = useSafeAreaInsets();

  const backdropOpacity = useSharedValue(isVisible ? 1 : 0);
  const sheetTranslateY = useSharedValue(isVisible ? 0 : screenHeight);
  const panY = useSharedValue(0);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value + panY.value }],
  }));

  useEffect(() => {
    if (isVisible) {
      panY.value = 0;
      backdropOpacity.value = withTiming(1, { duration: 180 });
      sheetTranslateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    } else {
      panY.value = 0;
      backdropOpacity.value = withTiming(0, { duration: 180 });
      sheetTranslateY.value = withTiming(screenHeight, {
        duration: 220,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [isVisible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      panY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 800) {
        runOnJS(handleClose)();
      } else {
        panY.value = withSpring(0, { damping: 22, stiffness: 300 });
      }
    });

  const sheetContent = (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={sheetStyle}>
        {showCloseButton && (
          <View className="items-center mb-4">
            <Touchable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="bg-[#424242] w-12 h-12 rounded-full items-center justify-center border border-white/20"
            >
              <icons.close_icon width={14} height={14} fill="#FFFFFF" />
            </Touchable>
          </View>
        )}
        <View
          style={{
            maxHeight: screenHeight * (maxHeightPercent / 100),
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            paddingHorizontal: px,
            paddingTop: pt,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
            backgroundColor,
            shadowColor: "#919EAB33",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 20,
          }}
        >
          {/* Drag handle pill */}
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16, marginTop: -8 }} />
          {children}
        </View>
      </Animated.View>
    </GestureDetector>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View
          style={[
            { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
            backdropStyle,
          ]}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={handleClose}
          />
          {keyboardAvoiding ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1, justifyContent: "flex-end" }}
              pointerEvents="box-none"
            >
              {sheetContent}
            </KeyboardAvoidingView>
          ) : (
            <View
              style={{ flex: 1, justifyContent: "flex-end" }}
              pointerEvents="box-none"
            >
              {sheetContent}
            </View>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
