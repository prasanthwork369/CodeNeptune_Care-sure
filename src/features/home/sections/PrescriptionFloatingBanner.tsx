import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import {
  PRESCRIPTION_STATUS,
  PrescriptionStatusValue,
} from "@/src/features/prescription/constants/prescription-status";
import { useIsVisible } from "@/src/hooks/ui/useVisibleInterval";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { Image } from "expo-image";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { PILL_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { HOME_IMAGES } from "@/src/constants/images";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

const DURATION = 250;
const EASE_IN_OUT = Easing.inOut(Easing.ease);

interface StatusConfig {
  title: string;
  subtitle: string;
  showProgress: boolean;
}

const STATUS_CONFIG: Record<PrescriptionStatusValue, StatusConfig> = {
  [PRESCRIPTION_STATUS.NEW]: {
    title: "Your prescription is under review",
    subtitle: "We'll keep you updated shortly",
    showProgress: true,
  },
  [PRESCRIPTION_STATUS.APPROVED]: {
    title: "Your prescription has been verified",
    subtitle: "Your Medicines Are Ready To Order",
    showProgress: false,
  },
  [PRESCRIPTION_STATUS.CANCELLED]: {
    title: "Prescription Rejected",
    subtitle: "Please Re-upload Your Prescription",
    showProgress: false,
  },
};

interface PrescriptionFloatingBannerProps {
  visible: boolean;
  status?: PrescriptionStatusValue;
  onPress?: () => void;
  onClose?: () => void;
}

export const PrescriptionFloatingBanner = ({
  visible,
  status = PRESCRIPTION_STATUS.NEW,
  onPress,
  onClose,
}: PrescriptionFloatingBannerProps) => {
  const slideY = useSharedValue(visible ? 0 : 150);
  const opacity = useSharedValue(visible ? 1 : 0);
  // The tab bar's own shared value — read directly so the banner reshapes on
  // the same frame as the bar rather than trailing it through a store update.
  const tabBarAnim = tabBarVisible;
  const progressAnim = useSharedValue(0);

  const config = STATUS_CONFIG[status];
  const isUnderReview = status === PRESCRIPTION_STATUS.NEW;
  const isVisible = useIsVisible();

  // Auto-progress: loop 0 → 0.88 over 10s, snap back to 0, repeat
  useEffect(() => {
    // An infinite withRepeat keeps the UI thread working forever, so it must
    // stop when Home is not on screen or the app is backgrounded.
    if (!isUnderReview || !isVisible) {
      cancelAnimation(progressAnim);
      progressAnim.value = withTiming(0, { duration: DURATION });
      return;
    }
    progressAnim.value = withRepeat(
      withSequence(
        withTiming(0.88, {
          duration: 10_000,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [isUnderReview, isVisible, progressAnim]);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220, easing: EASE_IN_OUT });
      slideY.value = withSpring(0, { damping: 17, stiffness: 110, mass: 0.6 });
    } else {
      slideY.value = withSpring(150, {
        damping: 17,
        stiffness: 110,
        mass: 0.6,
      });
      opacity.value = withTiming(0, {
        duration: DURATION,
        easing: EASE_IN_OUT,
      });
    }
  }, [visible, status, opacity, slideY]);

  const exact77 = exactScale(77);
  const exact12 = exactScale(12);

  // The upload button is always collapsed exactly when the bar is hidden, so
  // one value drives the whole reshape. Deriving it from a second, JS-driven
  // value would run the shrink on two clocks and read as a broken two-stage
  // animation.
  // paddingRight reserves real space for the FAB, so it stays a true layout
  // property — a transform would move the pill instead of resizing it.
  const containerStyle = useAnimatedStyle(() => ({
    paddingLeft: exact12,
    paddingRight: interpolate(tabBarAnim.value, [0, 1], [exact77, exact12]),
    transform: [{ translateY: slideY.value }],
    opacity: opacity.value,
  }));

  // Inline progress pill: fills a dynamic track width based on expansion state.
  // Stays a real width (not a transform) because the subtitle text next to it
  // depends on that width via flex to know how much room it has to truncate into.
  const trackWidthStyle = useAnimatedStyle(() => {
    const trackWidth = interpolate(tabBarAnim.value, [0, 1], [48, 90]);
    return {
      width: trackWidth,
    };
  });

  // Fill tracks the track's own (still layout-driven) width via 100%, then
  // scales in from the left — keeps the continuous 10s loop off layout entirely.
  const progressBarStyle = useAnimatedStyle(() => ({
    width: "100%",
    transformOrigin: "0% 50%",
    transform: [{ scaleX: progressAnim.value }],
  }));

  const subtitleText = config.subtitle;

  return (
    <Animated.View style={containerStyle}>
      <View
        style={{
          // Lighter than the tab bar pill's 15% — the banner sits over content.
          boxShadow: "0px 0px 20px 0px #00000017",
          borderRadius: exactScale(999),
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            borderRadius: exactScale(999),
            overflow: "hidden",
            backgroundColor: "white",
          }}
          className="border border-[#0000000D]"
        >
          <View
            className="flex-row items-center bg-white"
            style={{ borderRadius: exactScale(999), height: PILL_HEIGHT }}
          >
            <Touchable
              activeOpacity={0.7}
              onPress={onPress}
              style={{ flex: 1 }}
            >
              <View
                className="flex-row items-center px-3"
                style={{ borderRadius: exactScale(999), height: PILL_HEIGHT }}
              >
                {/* Rx Icon */}
                <View className="mr-3 items-center justify-center">
                  {status === PRESCRIPTION_STATUS.APPROVED ? (
                    <Image
                      source={HOME_IMAGES.prescriptionApproved}
                      style={{ width: exactScale(44), height: exactScale(44) }}
                      contentFit="contain"
                    />
                  ) : status === PRESCRIPTION_STATUS.CANCELLED ? (
                    <Image
                      source={HOME_IMAGES.prescriptionRejected}
                      style={{ width: exactScale(36), height: exactScale(36) }}
                      contentFit="contain"
                    />
                  ) : (
                    <Image
                      source={HOME_IMAGES.prescription}
                      style={{ width: exactScale(44), height: exactScale(44) }}
                      contentFit="contain"
                    />
                  )}
                </View>

                {/* Text section */}
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    gap: exactScale(3),
                    minWidth: 0,
                  }}
                >
                  <Text
                    className="font-inter-bold text-[#1A1C1E]"
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(13),
                      lineHeight: moderateScale(17),
                    }}
                  >
                    {config.title}
                  </Text>

                  {/* Subtitle + inline progress pill */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: exactScale(6),
                    }}
                  >
                    <Text
                      className="font-inter-medium text-[#6A6A6A]"
                      numberOfLines={1}
                      style={{ flexShrink: 1, fontSize: moderateScale(11) }}
                    >
                      {subtitleText}
                    </Text>

                    {config.showProgress && (
                      <Animated.View
                        style={[
                          {
                            height: exactScale(6),
                            borderRadius: exactScale(999),
                            backgroundColor: "#E5E7EB",
                            overflow: "hidden",
                            flexShrink: 0,
                          },
                          trackWidthStyle,
                        ]}
                      >
                        <Animated.View
                          style={[
                            {
                              height: exactScale(6),
                              borderRadius: exactScale(999),
                              backgroundColor: "#0F7635",
                            },
                            progressBarStyle,
                          ]}
                        />
                      </Animated.View>
                    )}
                  </View>
                </View>
              </View>
            </Touchable>

            {onClose && (
              <Touchable
                activeOpacity={0.7}
                onPress={onClose}
                hitSlop={{
                  top: exactScale(10),
                  bottom: exactScale(10),
                  left: exactScale(10),
                  right: exactScale(10),
                }}
                style={{
                  width: exactScale(32),
                  height: exactScale(32),
                  borderRadius: exactScale(16),
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: exactScale(8),
                }}
              >
                <icons.close_small
                  width={exactScale(12)}
                  height={exactScale(12)}
                  fill="#9CA3AF"
                />
              </Touchable>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
