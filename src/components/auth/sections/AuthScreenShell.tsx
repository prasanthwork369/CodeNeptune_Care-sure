import { AuthMedicineBackground } from '@/src/components/auth/AuthMedicineBackground';
import { icons } from '@/src/constants/icons';

import * as Haptics from 'expo-haptics';
import { useNav } from '@/src/hooks/useNav';
import React from 'react';
import { Keyboard, Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthScreenShellProps {
    children: React.ReactNode;
    onSkip?: () => void;
    // Extra scrollable space (as a fraction of window height) added below the
    // content so KeyboardAwareScrollView has room to scroll the focused input
    // above the keyboard, even when the content alone doesn't overflow.
    keyboardShift?: number;
}

export const AuthScreenShell: React.FC<AuthScreenShellProps> = ({
    children,
    onSkip,
    keyboardShift = 0,
}) => {
    const router = useNav();
    const insets = useSafeAreaInsets();
    const { height: windowHeight, width } = useWindowDimensions();
    // Pin to mount-time value so Android adjustResize keyboard events
    // don't trigger a layout reflow mid-scroll, causing KASV to measure stale positions.
    const [backgroundHeight] = React.useState(() => windowHeight * 0.6);

    const isTablet = width >= 600;
    const panelMaxWidth = isTablet ? 560 : undefined;
    const panelPaddingH = isTablet ? Math.round(width * 0.08) : 32;

    const scrollViewRef = React.useRef<any>(null);

    // Manually drive the scroll on focus/blur instead of relying on KASV's
    // automatic measurement, which can be a no-op when the content doesn't
    // already overflow the viewport (e.g. the short login form).
    React.useEffect(() => {
        if (!keyboardShift) return;
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        // Scroll up just enough to clear the keyboard, same offset OTP uses.
        const targetY = Platform.select({ android: 160, ios: 140, default: 140 });

        const showSub = Keyboard.addListener(showEvent, () => {
            scrollViewRef.current?.scrollToPosition(0, targetY, true);
        });
        const hideSub = Keyboard.addListener(hideEvent, () => {
            scrollViewRef.current?.scrollToPosition(0, 0, true);
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [keyboardShift]);

    const skipScale = useSharedValue(1);
    const skipStyle = useAnimatedStyle(() => ({
        transform: [{ scale: skipScale.value }],
    }));

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSkip ? onSkip() : router.replace('/(tabs)');
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Background illustration — fixed behind the ScrollView */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: backgroundHeight, zIndex: 0 }}>
                <AuthMedicineBackground />
            </View>

            {/* Skip button — stays fixed on top */}
            <Animated.View
                style={[{ position: 'absolute', top: Math.max(insets.top, 20) + 20, right: 24, zIndex: 50 }, skipStyle]}
            >
                <Pressable
                    className="bg-white px-4 py-2 rounded-full flex-row items-center border border-brand-border"
                    accessibilityRole="button"
                    accessibilityLabel="Skip"
                    onPressIn={() => { skipScale.value = withSpring(0.93, { damping: 15, stiffness: 300 }); }}
                    onPressOut={() => { skipScale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
                    onPress={handleSkip}
                >
                    <Text className="text-brand-primary font-inter-medium mr-1 leading-none">Skip</Text>
                    <icons.arrow_forward_green width={12} height={12} />
                </Pressable>
            </Animated.View>

            {/* KeyboardAwareScrollView for the white panel content only */}
            <KeyboardAwareScrollView
                ref={scrollViewRef}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={Platform.select({ android: 160, ios: 140, default: 140 })}
                resetScrollToCoords={{ x: 0, y: 0 }}
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ flex: 1 }}
            >
                <Pressable onPress={Keyboard.dismiss} style={{ flexGrow: 1 }}>
                    {/* Top spacer matching the background illustration height (minus overlap) */}
                    <View style={{ height: backgroundHeight - 24, backgroundColor: 'transparent' }} />

                    {/* White panel */}
                    <View
                        style={{
                            flexGrow: 1,
                            backgroundColor: 'white',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingHorizontal: panelPaddingH,
                            maxWidth: panelMaxWidth,
                            width: '100%',
                            alignSelf: 'center',
                        }}
                    >
                        {/* Content starts with spacing; static bottom padding preserves exact closed-state visual layout */}
                        <View style={{ flexGrow: 1, paddingTop: 32, paddingBottom: insets.bottom + 24 }}>
                            {children}
                        </View>

                        {/* Extra scroll room so the keyboard can push the focused input into view */}
                        {keyboardShift > 0 && (
                            <View style={{ height: 200 }} />
                        )}
                    </View>
                </Pressable>
            </KeyboardAwareScrollView>
        </View>
    );
};