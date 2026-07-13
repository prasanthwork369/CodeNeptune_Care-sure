import { MEDICINES } from "@/src/constants/search-cycle";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { exactScale } from "@/src/utils/exactScale";

const SLOT_H = exactScale(20);
const TYPING_SPEED = 80;
const HOLD_MS = 2500;
const FADE_OUT_MS = 300;

export const HomeSearchCycler: React.FC = () => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  const textOpacity = useSharedValue(1);

  // Blinking typing cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typewriter step logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const currentWord = MEDICINES[currentWordIdx];

    if (isTyping) {
      setCursorVisible(true); // Force cursor visible while animating
      if (displayedText.length === currentWord.length) {
        setIsTyping(false);
        // Start hold duration
        timer = setTimeout(() => {
          // Trigger fade out on Reanimated thread
          textOpacity.value = withTiming(0, { duration: FADE_OUT_MS }, (finished) => {
            if (finished) {
              runOnJS(goToNextWord)();
            }
          });
        }, HOLD_MS);
      } else {
        timer = setTimeout(() => {
          setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        }, TYPING_SPEED);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isTyping, currentWordIdx]);

  const goToNextWord = () => {
    setDisplayedText("");
    setCurrentWordIdx((prev) => (prev + 1) % MEDICINES.length);
    textOpacity.value = 1;
    setIsTyping(true);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

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
      {/* Fixed prefix */}
      <Text style={textStyle} numberOfLines={1} allowFontScaling={false}>
        Search for{" "}
      </Text>
      {/* Animated typewriter word with blinking cursor */}
      <Animated.View style={[styles.window, animatedStyle]}>
        <Text style={[styles.textBase, styles.bold]} numberOfLines={1} allowFontScaling={false}>
          &quot;{displayedText}&quot;
          <Text style={styles.cursor}>{cursorVisible ? "|" : " "}</Text>
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: "row", alignItems: "center", height: SLOT_H },
  window: { flex: 1, height: SLOT_H, justifyContent: "center" },
  textBase: {
    fontSize: exactScale(14),
    lineHeight: SLOT_H,
    fontWeight: "500",
    color: "#9CA3AF",
    includeFontPadding: false,
  },
  bold: {
    fontWeight: "600",
    color: "#6B7280",
    fontFamily: Platform.select({ ios: "Courier", android: "monospace", default: "monospace" }),
  },
  cursor: { color: "#0F7635", fontWeight: "bold" },
});
