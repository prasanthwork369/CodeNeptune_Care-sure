import React, { useEffect, useState } from 'react';
import { View, Text, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

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
        opacity.value = withTiming(isActive ? 1 : 0, { duration: DURATION, easing: ease });
        translateY.value = withTiming(
            isActive ? 0 : isPrevious ? -lineHeight : lineHeight,
            { duration: DURATION, easing: ease }
        );
    }, [isActive, isPrevious]);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.Text
            style={[{ position: 'absolute', top: 0, left: 0, lineHeight, includeFontPadding: false }, style, animStyle]}
            className={className}
        >
            {word}
        </Animated.Text>
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
            setActiveIndex(prev => {
                setPrevIndex(prev);
                return (prev + 1) % words.length;
            });
        }, interval);
        return () => clearInterval(timer);
    }, [words.length, interval]);

    if (words.length === 0) return null;

    if (words.length === 1) {
        return (
            <Text style={[{ lineHeight }, style]} className={className}>
                {words[0]}
            </Text>
        );
    }

    const longestWord = [...words].sort((a, b) => b.length - a.length)[0];

    return (
        <View style={{ height: lineHeight, overflow: 'hidden', flexShrink: 0 }}>
            {/* reserves width without visible text */}
            <Text
                style={[{ lineHeight, opacity: 0, includeFontPadding: false }, style]}
                className={className}
                pointerEvents="none"
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
