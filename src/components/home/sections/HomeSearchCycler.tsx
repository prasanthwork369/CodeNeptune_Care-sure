import { MEDICINES } from "@/src/constants/search-cycle";
import React, { useEffect, useReducer, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { exactScale } from "@/src/utils/exactScale";

const SLOT_H = exactScale(20);
const ANIM_MS = 480;
const HOLD_MS = 2500;
const SLIDE_X = exactScale(24);

const EASE_OUT = Easing.bezier(0.25, 1, 0.5, 1);
const EASE_IN = Easing.bezier(0.5, 0, 0.75, 0);

export const HomeSearchCycler: React.FC = () => {
  const aX = useSharedValue(0);
  const bX = useSharedValue(SLIDE_X);
  const aOp = useSharedValue(1);
  const bOp = useSharedValue(0);

  const aIdx = useRef(0);
  const bIdx = useRef(1);
  const activeSlot = useRef<"a" | "b">("a");
  const busy = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [, repaint] = useReducer((n) => n + 1, 0);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: aX.value }],
    opacity: aOp.value,
  }));
  const bStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bX.value }],
    opacity: bOp.value,
  }));

  const scheduleNext = () => {
    timerRef.current = setTimeout(animate, HOLD_MS);
  };

  const onDone = () => {
    if (activeSlot.current === "a") {
      aIdx.current = (bIdx.current + 1) % MEDICINES.length;
      aX.value = SLIDE_X;
      aOp.value = 0;
      activeSlot.current = "b";
    } else {
      bIdx.current = (aIdx.current + 1) % MEDICINES.length;
      bX.value = SLIDE_X;
      bOp.value = 0;
      activeSlot.current = "a";
    }
    repaint();
    busy.current = false;
    scheduleNext();
  };

  const animate = () => {
    if (busy.current) return;
    busy.current = true;

    if (activeSlot.current === "a") {
      aX.value = withTiming(-SLIDE_X, { duration: ANIM_MS, easing: EASE_IN });
      aOp.value = withTiming(0, { duration: ANIM_MS * 0.7 });

      bX.value = withTiming(0, { duration: ANIM_MS, easing: EASE_OUT }, (done) => {
        if (done) runOnJS(onDone)();
      });
      bOp.value = withDelay(
        ANIM_MS * 0.15,
        withTiming(1, { duration: ANIM_MS * 0.8 })
      );
    } else {
      bX.value = withTiming(-SLIDE_X, { duration: ANIM_MS, easing: EASE_IN });
      bOp.value = withTiming(0, { duration: ANIM_MS * 0.7 });

      aX.value = withTiming(0, { duration: ANIM_MS, easing: EASE_OUT }, (done) => {
        if (done) runOnJS(onDone)();
      });
      aOp.value = withDelay(
        ANIM_MS * 0.15,
        withTiming(1, { duration: ANIM_MS * 0.8 })
      );
    }
  };

  useEffect(() => {
    timerRef.current = setTimeout(animate, HOLD_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const textStyle = {
    fontSize: exactScale(14),
    lineHeight: SLOT_H,
    fontWeight: "500" as const,
    color: "#9CA3AF",
    includeFontPadding: false,
    verticalAlign: "middle" as const,
  };

  return (
    <View style={styles.row}>
      <Text style={textStyle} numberOfLines={1} allowFontScaling={false}>
        Search for{" "}
      </Text>
      <View style={styles.window}>
        <Animated.Text style={[textStyle, styles.bold, styles.slot, aStyle]} numberOfLines={1} allowFontScaling={false}>
          &quot;{MEDICINES[aIdx.current]}&quot;
        </Animated.Text>
        <Animated.Text style={[textStyle, styles.bold, styles.slot, bStyle]} numberOfLines={1} allowFontScaling={false}>
          &quot;{MEDICINES[bIdx.current]}&quot;
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: "row", alignItems: "center", height: SLOT_H },
  window: { flex: 1, height: SLOT_H, overflow: "hidden" },
  slot: { position: "absolute", left: 0, top: 0, bottom: 0 },
  bold: { fontWeight: "600", color: "#6B7280" },
});
