import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { icons } from "@/src/constants/icons";
import { TrackingStep } from "@/src/types/order";
import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#DC2626",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <icons.cancel_white width={10} height={10} />
        </View>
      );
    }
    if (step.isActive) {
      return (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "#16A34A",
            borderWidth: 3,
            borderColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 1,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#fff",
            }}
          />
        </View>
      );
    }
    if (step.completed) {
      return (
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#16A34A",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 9,
              fontFamily: "Inter-Bold",
              lineHeight: 11,
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
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: "#D1D5DB",
          backgroundColor: "#fff",
          marginTop: 3,
        }}
      />
    );
  };

  return (
    <Animated.View style={[{ flexDirection: "row" }, rowStyle]}>
      <View style={{ width: 26, alignItems: "center", alignSelf: "stretch" }}>
        {renderDot()}
        {!isLast && (
          <View style={{ width: 2, flex: 1, backgroundColor: lineColor }} />
        )}
      </View>

      <View
        style={{ flex: 1, paddingLeft: 12, paddingBottom: isLast ? 4 : 24 }}
      >
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter-SemiBold",
            color: textColor,
          }}
        >
          {step.title}
        </Text>
        {(step.completed || step.cancelled) && !!step.time && (
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Inter",
              color: "#6A6A6A",
              marginTop: 3,
            }}
          >
            {step.time}
          </Text>
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
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["50%", "75%"], []);

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      snapPoints={snapPoints}
      closeButtonOffset="50%"
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Inter_700Bold",
            color: "#1A1C1E",
            marginBottom: 20,
          }}
        >
          Order Tracking
        </Text>

        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
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
