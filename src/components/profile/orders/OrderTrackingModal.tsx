import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { TrackingStep } from "@/src/types/order";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// ─── Config ────────────────────────────────────────────────────────────────────

const EASE_OUT = Easing.out(Easing.cubic);
// Steps start after the sheet has settled (~380 ms)
const STEP_BASE_DELAY = 380;
const STEP_INTERVAL = 110;

// ─── Single step row ───────────────────────────────────────────────────────────

interface StepRowProps {
  step: TrackingStep;
  index: number;
  isLast: boolean;
  triggered: boolean;
}

function ModalStepRow({ step, index, isLast, triggered }: StepRowProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 10;
    if (!triggered) return;
    const d = STEP_BASE_DELAY + index * STEP_INTERVAL;
    opacity.value = withDelay(
      d,
      withTiming(1, { duration: 260, easing: EASE_OUT }),
    );
    translateY.value = withDelay(
      d,
      withTiming(0, { duration: 260, easing: EASE_OUT }),
    );
  }, [triggered]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Radar-style pulse on the current step, like realtime tracking apps: a green
  // halo behind the "you are here" dot that expands and fades on a loop.
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (step.isActive) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 1600, easing: EASE_OUT }),
        -1,
        false,
      );
    } else {
      pulse.value = 0;
    }
  }, [step.isActive]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.9 }],
    opacity: 0.4 * (1 - pulse.value),
  }));

  // Smooth "live" blink for the In-progress indicator dot on the active step.
  const blink = useSharedValue(1);
  useEffect(() => {
    if (step.isActive) {
      blink.value = withRepeat(
        withTiming(0.25, { duration: 700, easing: EASE_OUT }),
        -1,
        true,
      );
    } else {
      blink.value = 1;
    }
  }, [step.isActive]);
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  const lineColor = step.completed && !step.isActive ? "#16A34A" : "#E5E7EB";
  const textColor = step.cancelled
    ? "#DC2626"
    : step.completed || step.isActive
      ? "#1A1C1E"
      : "#9CA3AF";

  const renderDot = () => {
    if (step.cancelled) {
      return (
        <View
          style={{
            width: exactScale(18),
            height: exactScale(18),
            borderRadius: exactScale(9),
            backgroundColor: "#DC2626",
            alignItems: "center",
            justifyContent: "center",
            marginTop: exactScale(2),
          }}
        >
          <icons.cancel_white width={exactScale(10)} height={exactScale(10)} />
        </View>
      );
    }
    if (step.isActive) {
      return (
        <View
          style={{
            width: exactScale(22),
            height: exactScale(22),
            alignItems: "center",
            justifyContent: "center",
            marginTop: exactScale(1),
          }}
        >
          {/* Pulsing radar halo */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: exactScale(22),
                height: exactScale(22),
                borderRadius: exactScale(11),
                backgroundColor: "#16A34A",
              },
              pulseStyle,
            ]}
          />
          <View
            style={{
              width: exactScale(22),
              height: exactScale(22),
              borderRadius: exactScale(11),
              backgroundColor: "#16A34A",
              borderWidth: 3,
              borderColor: "#DCFCE7",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: exactScale(8),
                height: exactScale(8),
                borderRadius: exactScale(4),
                backgroundColor: "#fff",
              }}
            />
          </View>
        </View>
      );
    }
    if (step.completed) {
      return (
        <View
          style={{
            width: exactScale(18),
            height: exactScale(18),
            borderRadius: exactScale(9),
            backgroundColor: "#16A34A",
            alignItems: "center",
            justifyContent: "center",
            marginTop: exactScale(2),
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: moderateScale(9),
              fontWeight: "700",
              lineHeight: moderateScale(11),
            }}
          >
            ✓
          </Text>
        </View>
      );
    }
    return (
      <View
        style={{
          width: exactScale(16),
          height: exactScale(16),
          borderRadius: exactScale(8),
          borderWidth: 1.5,
          borderColor: "#D1D5DB",
          backgroundColor: "#fff",
          marginTop: exactScale(3),
        }}
      />
    );
  };

  return (
    <Animated.View style={[{ flexDirection: "row" }, rowStyle]}>
      <View
        style={{
          width: exactScale(26),
          alignItems: "center",
          alignSelf: "stretch",
        }}
      >
        {renderDot()}
        {!isLast && (
          <View style={{ width: 2, flex: 1, backgroundColor: lineColor }} />
        )}
      </View>

      <View
        style={{
          flex: 1,
          paddingLeft: exactScale(12),
          paddingBottom: isLast ? exactScale(4) : exactScale(24),
        }}
      >
        {step.isActive ? (
          // Highlighted "you are here" card — makes the current stage pop, like
          // realtime delivery apps.
          <View
            style={{
              backgroundColor: "#EEFFF4",
              borderWidth: 0.5,
              borderColor: "#0F76354D",
              borderRadius: exactScale(12),
              paddingHorizontal: exactScale(12),
              paddingVertical: exactScale(10),
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(14),
                fontWeight: "700",
                color: "#166534",
              }}
            >
              {step.title}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: exactScale(5),
              }}
            >
              <Animated.View
                style={[
                  {
                    width: exactScale(6),
                    height: exactScale(6),
                    borderRadius: exactScale(3),
                    backgroundColor: "#16A34A",
                    marginRight: exactScale(6),
                  },
                  blinkStyle,
                ]}
              />
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontWeight: "700",
                  color: "#16A34A",
                }}
              >
                In progress
              </Text>
              {!!step.time && (
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    color: "#6A6A6A",
                    marginLeft: exactScale(8),
                  }}
                >
                  {step.time}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <>
            <Text
              style={{
                fontSize: moderateScale(14),
                fontWeight: "600",
                color: textColor,
              }}
            >
              {step.title}
            </Text>
            {(step.completed || step.cancelled) && !!step.time && (
              <Text
                style={{
                  fontSize: moderateScale(12),
                  color: "#6A6A6A",
                  marginTop: exactScale(3),
                }}
              >
                {step.time}
              </Text>
            )}
          </>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  steps: TrackingStep[];
}

export function OrderTrackingModal({ visible, onClose, steps }: Props) {
  const adjustedBottom = useAdjustedBottomInset();
  const snapPoints = useMemo(() => ["60%", "75%"], []);

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      snapPoints={snapPoints}
      closeButtonOffset="60%"
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: exactScale(12),
        borderTopRightRadius: exactScale(12),
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          // Horizontal padding lives on the title + scroll content (not here) so
          // the scroll frame spans full width — otherwise the active step's
          // pulse halo, which sits at the left edge, gets clipped by the frame.
          paddingTop: exactScale(20),
          paddingBottom:
            Math.max(adjustedBottom, exactScale(16)) + exactScale(16),
        }}
      >
        <Text
          style={{
            fontSize: moderateScale(18),
            fontWeight: "600",
            color: "#1A1C1E",
            marginBottom: exactScale(20),
            paddingHorizontal: exactScale(20),
          }}
        >
          Order Tracking
        </Text>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: exactScale(20),
            // The first active step has no preceding row to provide overflow
            // space. Reserve room for its expanding pulse so "Order Placed"
            // and its timestamp are not clipped at the scroll-frame top.
            paddingTop: exactScale(12),
          }}
        >
          {steps.map((step, index) => (
            <ModalStepRow
              key={index}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
              triggered={visible}
            />
          ))}
        </BottomSheetScrollView>
      </BottomSheetView>
    </GorhomBottomSheet>
  );
}
