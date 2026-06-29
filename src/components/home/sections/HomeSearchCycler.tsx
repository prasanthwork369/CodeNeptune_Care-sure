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
const ANIM_MS = 420;
const HOLD_MS = 2800;
// Gentle ease-in-out — soft start AND soft landing, no abrupt movement
const EASE = Easing.inOut(Easing.cubic);

export const HomeSearchCycler: React.FC = () => {
  // Translate + opacity per slot for a cross-fade slide feel
  const aY = useSharedValue(0);
  const bY = useSharedValue(SLOT_H);
  const aOp = useSharedValue(1);
  const bOp = useSharedValue(0);

  const aIdx = useRef(0);
  const bIdx = useRef(1);
  const activeSlot = useRef<"a" | "b">("a");
  const busy = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [, repaint] = useReducer((n) => n + 1, 0);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: aY.value }],
    opacity: aOp.value,
  }));
  const bStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bY.value }],
    opacity: bOp.value,
  }));

  const scheduleNext = () => {
    timerRef.current = setTimeout(animate, HOLD_MS);
  };

  const onDone = () => {
    if (activeSlot.current === "a") {
      aIdx.current = (bIdx.current + 1) % MEDICINES.length;
      aY.value = SLOT_H;
      aOp.value = 0;
      activeSlot.current = "b";
    } else {
      bIdx.current = (aIdx.current + 1) % MEDICINES.length;
      bY.value = SLOT_H;
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
      aY.value = withTiming(-SLOT_H, { duration: ANIM_MS, easing: EASE });
      aOp.value = withTiming(0, {
        duration: ANIM_MS * 0.65,
        easing: Easing.in(Easing.cubic),
      });
      bY.value = withTiming(0, { duration: ANIM_MS, easing: EASE }, (done) => {
        if (done) runOnJS(onDone)();
      });
      bOp.value = withDelay(
        ANIM_MS * 0.25,
        withTiming(1, {
          duration: ANIM_MS * 0.75,
          easing: Easing.out(Easing.cubic),
        }),
      );
    } else {
      bY.value = withTiming(-SLOT_H, { duration: ANIM_MS, easing: EASE });
      bOp.value = withTiming(0, {
        duration: ANIM_MS * 0.65,
        easing: Easing.in(Easing.cubic),
      });
      aY.value = withTiming(0, { duration: ANIM_MS, easing: EASE }, (done) => {
        if (done) runOnJS(onDone)();
      });
      aOp.value = withDelay(
        ANIM_MS * 0.25,
        withTiming(1, {
          duration: ANIM_MS * 0.75,
          easing: Easing.out(Easing.cubic),
        }),
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
    <View style={styles.window}>
      <Animated.Text style={[textStyle, styles.slot, aStyle]} numberOfLines={1} allowFontScaling={false}>
        Search for{" "}
        <Text style={styles.bold} allowFontScaling={false}>&quot;{MEDICINES[aIdx.current]}&quot;</Text>
      </Animated.Text>
      <Animated.Text style={[textStyle, styles.slot, bStyle]} numberOfLines={1} allowFontScaling={false}>
        Search for{" "}
        <Text style={styles.bold} allowFontScaling={false}>&quot;{MEDICINES[bIdx.current]}&quot;</Text>
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  window: { flex: 1, height: SLOT_H, overflow: "hidden" },
  slot: { position: "absolute", left: 0, top: 0, bottom: 0 },
  bold: { fontWeight: "600", color: "#6B7280" },
});
