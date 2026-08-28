import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import {
  PRESCRIPTION_STATUS,
  PrescriptionStatusValue,
} from "@/src/features/prescription/constants/prescription-status";
import { useIsVisible } from "@/src/hooks/ui/useVisibleInterval";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { Image } from "expo-image";
import React, { useEffect } from "react";
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
import { HOME_IMAGES } from "@/src/constants/images";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./PrescriptionFloatingBanner.styles";

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
  const tabBarAnim = tabBarVisible;
  const progressAnim = useSharedValue(0);

  const config = STATUS_CONFIG[status];
  const isUnderReview = status === PRESCRIPTION_STATUS.NEW;
  const isVisible = useIsVisible();

  // Auto-progress: loop 0 → 0.88 over 10s, snap back to 0, repeat
  useEffect(() => {
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

  const containerStyle = useAnimatedStyle(() => ({
    paddingLeft: exact12,
    paddingRight: interpolate(tabBarAnim.value, [0, 1], [exact77, exact12]),
    transform: [{ translateY: slideY.value }],
    opacity: opacity.value,
    zIndex: 10,
  }));

  const trackWidthStyle = useAnimatedStyle(() => {
    const trackWidth = interpolate(tabBarAnim.value, [0, 1], [48, 90]);
    return {
      width: trackWidth,
    };
  });

  const progressBarStyle = useAnimatedStyle(() => ({
    width: "100%",
    transformOrigin: "0% 50%",
    transform: [{ scaleX: progressAnim.value }],
  }));

  const getStatusIcon = () => {
    switch (status) {
      case PRESCRIPTION_STATUS.APPROVED:
        return HOME_IMAGES.prescriptionApproved;
      case PRESCRIPTION_STATUS.CANCELLED:
        return HOME_IMAGES.prescriptionRejected;
      default:
        return HOME_IMAGES.prescription;
    }
  };

  return (
    <Animated.View style={containerStyle}>
      <View style={s.pillShadowWrap}>
        <View style={s.pillBorderWrap}>
          <Touchable
            activeOpacity={0.9}
            onPress={onPress}
            style={{ width: "100%" }}
          >
            <View style={s.bannerInnerRow}>
              {/* Rx Icon */}
              <Image
                source={getStatusIcon()}
                style={
                  status === PRESCRIPTION_STATUS.CANCELLED
                    ? s.iconImageCancelled
                    : s.iconImage
                }
                contentFit="contain"
              />

              {/* Text Container */}
              <View style={s.textCol}>
                <Text
                  numberOfLines={1}
                  style={s.titleText}
                >
                  {config.title}
                </Text>
                <View style={s.subtitleRow}>
                  {config.showProgress && (
                    <Animated.View
                      style={[
                        s.progressTrack,
                        trackWidthStyle,
                      ]}
                    >
                      <Animated.View
                        style={[
                          s.progressFill,
                          progressBarStyle,
                        ]}
                      />
                    </Animated.View>
                  )}
                  <Text
                    numberOfLines={1}
                    style={s.subtitleText}
                  >
                    {config.subtitle}
                  </Text>
                </View>
              </View>

              {/* Close/Dismiss Button */}
              {onClose && (
                <Touchable
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{
                    top: exactScale(10),
                    bottom: exactScale(10),
                    left: exactScale(10),
                    right: exactScale(10),
                  }}
                  style={s.closeBtn}
                >
                  <icons.close_small
                    width={exactScale(12)}
                    height={exactScale(12)}
                    fill="#9CA3AF"
                  />
                </Touchable>
              )}
            </View>
          </Touchable>
        </View>
      </View>
    </Animated.View>
  );
};
