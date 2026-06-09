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
import PRESCRIPTION_ICON from "../../../../assets/images/home/prescription.png";

const DURATION = 250;
const EASE_IN_OUT = Easing.inOut(Easing.ease);


interface StatusConfig {
  title: string;
  subtitle: string;
  showProgress: boolean;
  showChevron: boolean;
}

const STATUS_CONFIG: Record<PrescriptionStatusValue, StatusConfig> = {
  [PRESCRIPTION_STATUS.NEW]: {
    title: "Your prescription is under review",
    subtitle: "We'll keep you updated shortly",
    showProgress: true,
    showChevron: false,
  },
  [PRESCRIPTION_STATUS.APPROVED]: {
    title: "Your prescription has been verified",
    subtitle: "Your Medicines Are Ready To Order",
    showProgress: false,
    showChevron: true,
  },
  [PRESCRIPTION_STATUS.CANCELLED]: {
    title: "Prescription Rejected",
    subtitle: "Please Re-upload Your Prescription",
    showProgress: false,
    showChevron: true,
  },
};

interface PrescriptionFloatingBannerProps {
  visible: boolean;
  status?: PrescriptionStatusValue;
  onPress?: () => void;
}

export const PrescriptionFloatingBanner = ({
  visible,
  status = PRESCRIPTION_STATUS.NEW,
  onPress,
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

  const chevronColor =
    status === PRESCRIPTION_STATUS.CANCELLED ? "#DC2626" : "#0F7635";

  const subtitleText = config.subtitle;

  return (
    <Animated.View style={containerStyle}>
      <View
        style={{
          shadowColor: "#919EAB",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 4,
          borderRadius: 999,
          backgroundColor: "white",
        }}
      >
        <View
          style={{
            borderRadius: 999,
            overflow: "hidden",
            backgroundColor: "white",
          }}
          className="border border-[#0000000D]"
        >
          <Touchable
            activeOpacity={0.7}
            onPress={onPress}
            style={{ width: "100%" }}
          >
            <View
              className="flex-row items-center px-3 bg-white"
              style={{ borderRadius: 999, height: 65 }}
            >
              {/* Rx Icon */}
              <View className="mr-3 items-center justify-center">
                {status === PRESCRIPTION_STATUS.APPROVED ? (
                  <Image
                    source={HOME_IMAGES.prescriptionApproved}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                ) : status === PRESCRIPTION_STATUS.CANCELLED ? (
                  <Image
                    source={HOME_IMAGES.prescriptionRejected}
                    style={{ width: 36, height: 36 }}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={PRESCRIPTION_ICON}
                    style={{ width: 44, height: 44 }}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* Text section */}
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  gap: 3,
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
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
                          height: 6,
                          borderRadius: 999,
                          backgroundColor: "#E5E7EB",
                          overflow: "hidden",
                          flexShrink: 0,
                        },
                        trackWidthStyle,
                      ]}
                    >
                      <Animated.View
                        style={[
                          { height: 6, borderRadius: 999, backgroundColor: "#0F7635" },
                          progressBarStyle,
                        ]}
                      />
                    </Animated.View>
                  )}
                </View>
              </View>

              {config.showChevron && (
                <View
                  style={{
                    marginLeft: 8,
                    marginRight: 4,
                    width: 20,
                    height: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <icons.arrow_forward_ios
                    width={14}
                    height={14}
                    fill={chevronColor}
                  />
                </View>
              )}
            </View>
          </Touchable>
        </View>
      </View>
    </Animated.View>
  );
};
