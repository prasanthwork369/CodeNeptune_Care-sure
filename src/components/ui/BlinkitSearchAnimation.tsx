import React, { useEffect, useReducer, useRef } from 'react';
import {
    NativeSyntheticEvent,
    StyleSheet,
    TextInput,
    TextInputFocusEventData,
    View,
} from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { icons } from '@/src/constants/icons';

const SLOT_H  = 20;
const ANIM_MS = 300;
const HOLD_MS = 2500;
const EASE    = Easing.out(Easing.cubic);

const SUGGESTIONS = [
    'Paracetamol 500mg',
    'Vitamin D3',
    'Cough Syrup',
    'Omeprazole',
    'Metformin',
    'Azithromycin',
    'Calcium Tablets',
    'Cetirizine',
];

interface BlinkitSearchAnimationProps {
    suggestions?: string[];
    onChangeText?: (text: string) => void;
    onSubmit?:     (text: string) => void;
    onFocus?: (e: any) => void;
    onBlur?:  (e: any) => void;
}

export const BlinkitSearchAnimation: React.FC<BlinkitSearchAnimationProps> = ({
    suggestions  = SUGGESTIONS,
    onChangeText,
    onSubmit,
    onFocus,
    onBlur,
}) => {
    const [query, setQuery] = React.useState('');

    // Two independent slots. A starts visible (y=0), B waits below (y=SLOT_H).
    const aY = useSharedValue(0);
    const bY = useSharedValue(SLOT_H);

    // All mutable animation state in refs — never stale inside setInterval
    const aIdx       = useRef(0);
    const bIdx       = useRef(1 % suggestions.length);
    const activeSlot = useRef<'a' | 'b'>('a');
    const busy       = useRef(false);
    const isPaused   = useRef(false);

    // Trigger re-render to update text content after each swap
    const [, repaint] = useReducer(n => n + 1, 0);

    const aStyle = useAnimatedStyle(() => ({ transform: [{ translateY: aY.value }] }));
    const bStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bY.value }] }));

    const onDone = () => {
        if (activeSlot.current === 'a') {
            // B is now visible at 0. Reset A below with next text.
            aIdx.current  = (bIdx.current + 1) % suggestions.length;
            aY.value      = SLOT_H; // instant — clipped, invisible
            activeSlot.current = 'b';
        } else {
            // A is now visible at 0. Reset B below with next text.
            bIdx.current  = (aIdx.current + 1) % suggestions.length;
            bY.value      = SLOT_H;
            activeSlot.current = 'a';
        }
        repaint();
        busy.current = false;
    };

    const animate = () => {
        if (busy.current || isPaused.current) return;
        busy.current = true;

        if (activeSlot.current === 'a') {
            aY.value = withTiming(-SLOT_H, { duration: ANIM_MS, easing: EASE });
            bY.value = withTiming(0,        { duration: ANIM_MS, easing: EASE }, (done) => {
                if (done) runOnJS(onDone)();
            });
        } else {
            bY.value = withTiming(-SLOT_H, { duration: ANIM_MS, easing: EASE });
            aY.value = withTiming(0,        { duration: ANIM_MS, easing: EASE }, (done) => {
                if (done) runOnJS(onDone)();
            });
        }
    };

    useEffect(() => {
        if (suggestions.length <= 1) return;
        const id = setInterval(animate, HOLD_MS);
        return () => clearInterval(id);
    }, []);

    const handleChangeText = (text: string) => {
        setQuery(text);
        isPaused.current = text.length > 0;
        onChangeText?.(text);
    };

    const handleFocus = (e: any) => {
        if (query.length > 0) isPaused.current = true;
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        if (query.length === 0) isPaused.current = false;
        onBlur?.(e);
    };

    const showTicker = query.length === 0;

    return (
        <View style={styles.bar}>
            <View style={styles.iconWrap}>
                <icons.search width={20} height={20} />
            </View>

            <View style={styles.textArea}>
                {/* Ticker — hidden when user is typing */}
                {showTicker && (
                    <View style={styles.window} pointerEvents="none">
                        <Animated.Text style={[styles.word, styles.slot, aStyle]} numberOfLines={1}>
                            {suggestions[aIdx.current]}
                        </Animated.Text>
                        <Animated.Text style={[styles.word, styles.slot, bStyle]} numberOfLines={1}>
                            {suggestions[bIdx.current]}
                        </Animated.Text>
                    </View>
                )}

                <TextInput
                    value={query}
                    onChangeText={handleChangeText}
                    onSubmitEditing={() => onSubmit?.(query)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={showTicker ? '' : 'Search medicines & health products'}
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="search"
                    style={[styles.input, showTicker && styles.inputHidden]}
                    autoCorrect={false}
                    autoCapitalize="none"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    iconWrap: {
        marginRight: 10,
        justifyContent: 'center',
    },
    textArea: {
        flex: 1,
        height: SLOT_H,
        justifyContent: 'center',
    },
    window: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    slot: {
        position: 'absolute',
        left: 0,
    },
    word: {
        height: SLOT_H,
        lineHeight: SLOT_H,
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#9CA3AF',
        includeFontPadding: false,
    },
    input: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#1A1C1E',
        padding: 0,
        margin: 0,
        height: SLOT_H,
        includeFontPadding: false,
    },
    inputHidden: {
        color: 'transparent',
    },
});
