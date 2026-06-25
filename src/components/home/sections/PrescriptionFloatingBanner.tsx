import { icons } from "@/src/constants/icons";
import {
    PRESCRIPTION_STATUS,
    PrescriptionStatusValue,
} from "@/src/constants/prescription-status";
import { useUIStore } from "@/src/store/uiStore";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
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
import PRESCRIPTION_ICON from "../../../../assets/images/prescription/prescription-pending.png";
import { exactScale } from "@/src/utils/exactScale";

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
  const { isUploadButtonCollapsed, isTabBarVisible } = useUIStore();

  const slideY = useSharedValue(visible ? 0 : 150);
  const opacity = useSharedValue(visible ? 1 : 0);
  const tabBarAnim = useSharedValue(isTabBarVisible ? 1 : 0);
  const uploadCollapsedAnim = useSharedValue(isUploadButtonCollapsed ? 1 : 0);
  const progressAnim = useSharedValue(0);

  const config = STATUS_CONFIG[status];
  const isUnderReview = status === PRESCRIPTION_STATUS.NEW;

  // Auto-progress: loop 0 → 0.88 over 10s, snap back to 0, repeat
  useEffect(() => {
    if (!isUnderReview) {
      progressAnim.value = withTiming(0, { duration: DURATION });
      return;
    }
    progressAnim.value = withRepeat(
      withSequence(
        withTiming(0.88, { duration: 10_000, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [isUnderReview]);

  useEffect(() => {
    tabBarAnim.value = withTiming(isTabBarVisible ? 1 : 0, {
      duration: DURATION,
      easing: EASE_IN_OUT,
    });
  }, [isTabBarVisible]);

  useEffect(() => {
    uploadCollapsedAnim.value = withTiming(isUploadButtonCollapsed ? 1 : 0, {
      duration: DURATION,
      easing: EASE_IN_OUT,
    });
  }, [isUploadButtonCollapsed]);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220, easing: EASE_IN_OUT });
      slideY.value = withSpring(0, { damping: 17, stiffness: 110, mass: 0.6 });
    } else {
      slideY.value = withSpring(150, { damping: 17, stiffness: 110, mass: 0.6 });
      opacity.value = withTiming(0, { duration: DURATION, easing: EASE_IN_OUT });
    }
  }, [visible, status]);

  const containerStyle = useAnimatedStyle(() => {
    const collapsedPaddingRight = interpolate(
      uploadCollapsedAnim.value,
      [0, 1],
      [125, 75],
    );
    return {
      paddingLeft: interpolate(tabBarAnim.value, [0, 1], [12, 16]),
      paddingRight: interpolate(
        tabBarAnim.value,
        [0, 1],
        [collapsedPaddingRight, 16],
      ),
      transform: [{ translateY: slideY.value }],
      opacity: opacity.value,
    };
  });

  // Inline progress pill: fills a dynamic track width based on expansion state
  const trackWidthStyle = useAnimatedStyle(() => {
    const trackWidth = interpolate(tabBarAnim.value, [0, 1], [48, 90]);
    return {
      width: trackWidth,
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    const trackWidth = interpolate(tabBarAnim.value, [0, 1], [48, 90]);
    return {
      width: progressAnim.value * trackWidth,
    };
  });

  const subtitleText = config.subtitle;

  return (
    <Animated.View style={containerStyle}>
      <View
        style={{
          shadowColor: "#919EAB",
          shadowOffset: { width: 0, height: exactScale(4) },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 4,
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
            style={{ borderRadius: exactScale(999), height: exactScale(65) }}
          >
          <Touchable
            activeOpacity={0.7}
            onPress={onPress}
            style={{ flex: 1 }}
          >
            <View
              className="flex-row items-center px-3"
              style={{ borderRadius: exactScale(999), height: exactScale(65) }}
            >
              {/* Rx Icon */}
              <View className="mr-3 items-center justify-center">
                {status === PRESCRIPTION_STATUS.APPROVED ? (
                  <Image
                    source={HOME_IMAGES.prescriptionApproved}
                    style={{ width: exactScale(44), height: exactScale(44) }}
                    resizeMode="contain"
                  />
                ) : status === PRESCRIPTION_STATUS.CANCELLED ? (
                  <Image
                    source={HOME_IMAGES.prescriptionRejected}
                    style={{ width: exactScale(36), height: exactScale(36) }}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={PRESCRIPTION_ICON}
                    style={{ width: exactScale(44), height: exactScale(44) }}
                    resizeMode="contain"
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
                  className="text-[13px] font-inter-bold text-[#1A1C1E] leading-[17px]"
                  numberOfLines={1}
                >
                  {config.title}
                </Text>

                {/* Subtitle + inline progress pill */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: exactScale(6) }}>
                  <Text
                    className="text-[11px] font-inter-medium text-[#6A6A6A]"
                    numberOfLines={1}
                    style={{ flexShrink: 1 }}
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
                          { height: exactScale(6), borderRadius: exactScale(999), backgroundColor: "#0F7635" },
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
              hitSlop={{ top: exactScale(10), bottom: exactScale(10), left: exactScale(10), right: exactScale(10) }}
              style={{
                width: exactScale(32),
                height: exactScale(32),
                borderRadius: exactScale(16),
                alignItems: "center",
                justifyContent: "center",
                marginRight: exactScale(8),
              }}
            >
              <icons.close_small width={exactScale(12)} height={exactScale(12)} fill="#9CA3AF" />
            </Touchable>
          )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
