import { MEDICINES } from "../constants/search-cycle";
import { useVisibleInterval } from "@/src/hooks/ui/useVisibleInterval";
import { exactScale } from "@/src/utils/exactScale";
import React, { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInRight,
  FadeOutLeft,
} from "react-native-reanimated";

const SLOT_HEIGHT = exactScale(20);
const CYCLE_INTERVAL_MS = 3_000;
const ENTER_DURATION_MS = 240;
const EXIT_DURATION_MS = 200;
const SLIDE_EASING = Easing.out(Easing.cubic);

/**
 * Horizontal slide with a soft fade for the Home search placeholder.
 *
 * Each cycle performs one React update. Reanimated moves the outgoing term
 * left while the next enters from the right, entirely on the UI thread.
 */
export const HomeSearchCycler: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  // useVisibleInterval adds the foreground check this was missing — it used to
  // keep cycling with the app in the user's pocket.
  useVisibleInterval(
    () => setActiveIndex((current) => (current + 1) % MEDICINES.length),
    CYCLE_INTERVAL_MS,
    !reduceMotion && MEDICINES.length > 1,
  );

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel="Search medicines and health products"
    >
      <Text style={styles.prefix} numberOfLines={1} allowFontScaling={false}>
        Search for{" "}
      </Text>

      <View style={styles.window}>
        <Animated.Text
          key={MEDICINES[activeIndex]}
          entering={
            reduceMotion
              ? undefined
              : FadeInRight.duration(ENTER_DURATION_MS).easing(SLIDE_EASING)
          }
          exiting={
            reduceMotion
              ? undefined
              : FadeOutLeft.duration(EXIT_DURATION_MS).easing(SLIDE_EASING)
          }
          style={styles.suggestion}
          numberOfLines={1}
          allowFontScaling={false}
        >
          &quot;{MEDICINES[activeIndex]}&quot;
        </Animated.Text>
      </View>
    </View>
  );
};

const sharedText = {
  fontSize: exactScale(14),
  lineHeight: SLOT_HEIGHT,
  includeFontPadding: false,
} as const;

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: SLOT_HEIGHT,
    minWidth: 0,
  },
  window: {
    flex: 1,
    height: SLOT_HEIGHT,
    overflow: "hidden",
  },
  prefix: {
    ...sharedText,
    flexShrink: 0,
    color: "#6A6A6A",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
  },
  suggestion: {
    ...sharedText,
    position: "absolute",
    left: 0,
    right: 0,
    color: "#4B5563",
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
  },
});
