import { MEDICINES } from "@/src/constants/search-cycle";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { exactScale } from "@/src/utils/exactScale";

const SLOT_H = exactScale(20);
const TYPING_SPEED = 70;
const DELETING_SPEED = 30;
const HOLD_MS = 2200;

export const HomeSearchCycler: React.FC = () => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  // Only animate while Home is the focused screen — the tab stays mounted when
  // the user switches tabs, so without this the typewriter keeps running (and
  // burning CPU) in the background.
  const isFocused = useIsFocused();

  // Blinking typing cursor effect
  useEffect(() => {
    if (!isFocused) return;
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, [isFocused]);

  // Typewriter step logic
  useEffect(() => {
    if (!isFocused) return;
    let timer: ReturnType<typeof setTimeout>;
    const currentWord = MEDICINES[currentWordIdx];

    if (isDeleting) {
      if (displayedText.length === 0) {
        setIsDeleting(false);
        setCurrentWordIdx((prev) => (prev + 1) % MEDICINES.length);
      } else {
        timer = setTimeout(() => {
          setDisplayedText(currentWord.substring(0, displayedText.length - 1));
        }, DELETING_SPEED);
      }
    } else {
      if (displayedText.length === currentWord.length) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, HOLD_MS);
      } else {
        timer = setTimeout(() => {
          setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        }, TYPING_SPEED);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentWordIdx, isFocused]);

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
      <View style={styles.window}>
        <Text style={[textStyle, styles.bold]} numberOfLines={1} allowFontScaling={false}>
          &quot;{displayedText}&quot;
          {/* Toggle opacity, not the character — swapping "|" for a space
              changes width and reflows the text every blink (the jerk). */}
          <Text style={[styles.cursor, { opacity: cursorVisible ? 1 : 0 }]}>
            |
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: "row", alignItems: "center", height: SLOT_H },
  window: { flex: 1, height: SLOT_H },
  bold: { fontWeight: "600", color: "#6B7280" },
  cursor: { color: "#0F7635", fontWeight: "bold" },
});
