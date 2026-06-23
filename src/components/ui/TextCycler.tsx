import React, { useEffect, useState } from "react";
import { Text, TextStyle, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

const DURATION = 700;
const ease = Easing.bezier(0.645, 0.045, 0.355, 1);

interface TextCyclerProps {
  words: string[];
  interval?: number;
  lineHeight: number;
  className?: string;
  style?: TextStyle;
}

const WordItem: React.FC<{
  word: string;
  isActive: boolean;
  isPrevious: boolean;
  lineHeight: number;
  className?: string;
  style?: TextStyle;
}> = ({ word, isActive, isPrevious, lineHeight, className, style }) => {
  const opacity = useSharedValue(isActive ? 1 : 0);
  const translateY = useSharedValue(isActive ? 0 : lineHeight);

  useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0, {
      duration: DURATION,
      easing: ease,
    });
    translateY.value = withTiming(
      isActive ? 0 : isPrevious ? -lineHeight : lineHeight,
      { duration: DURATION, easing: ease },
    );
  }, [isActive, isPrevious]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    // Animation lives on the View, not the Text -- Animated.Text doesn't
    // reliably support adjustsFontSizeToFit, so the word itself is a plain
    // Text that can actually shrink to fit instead of clipping a letter.
    <Animated.View
      style={[
        { position: "absolute", top: 0, left: 0, right: 0, height: lineHeight },
        animStyle,
      ]}
    >
      <Text
        style={[{ lineHeight, includeFontPadding: false }, style]}
        className={className}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {word}
      </Text>
    </Animated.View>
  );
};

export const TextCycler: React.FC<TextCyclerProps> = ({
  words,
  interval = 2500,
  lineHeight,
  className,
  style,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        setPrevIndex(prev);
        return (prev + 1) % words.length;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  if (words.length === 0) return null;

  if (words.length === 1) {
    return (
      <Text
        style={[{ lineHeight, flexShrink: 1 }, style]}
        className={className}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {words[0]}
      </Text>
    );
  }

  const longestWord = [...words].sort((a, b) => b.length - a.length)[0];

  return (
    <View
      style={{
        height: lineHeight,
        overflow: "hidden",
        flexShrink: 1,
        minWidth: 0,
      }}
    >
      {/* reserves width without visible text -- shrinks/ellipsizes instead of
                overflowing past the available space when the longest cycling word
                doesn't fit (e.g. a long CMS-driven highlight word on a narrow screen) */}
      <Text
        style={[{ lineHeight, opacity: 0, includeFontPadding: false }, style]}
        className={className}
        numberOfLines={1}
        pointerEvents="none"
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {longestWord}
      </Text>
      {words.map((word, idx) => (
        <WordItem
          key={idx}
          word={word}
          isActive={idx === activeIndex}
          isPrevious={idx === prevIndex}
          lineHeight={lineHeight}
          className={className}
          style={style}
        />
      ))}
    </View>
  );
};
