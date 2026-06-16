import { AuthMedicineBackground } from '@/src/components/auth/AuthMedicineBackground';
import { icons } from '@/src/constants/icons';
import { useAuthStore } from '@/src/store/authStore';
import * as Haptics from 'expo-haptics';
import { useNav } from '@/src/hooks/useNav';
import React from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthScreenShellProps {
    children: React.ReactNode;
    onSkip?: () => void;
    footer?: React.ReactNode;
}

export const AuthScreenShell: React.FC<AuthScreenShellProps> = ({
    children,
    onSkip,
    footer,
}) => {
    const router = useNav();
    const insets = useSafeAreaInsets();
    const { height: windowHeight, width } = useWindowDimensions();

    // Pinned at mount so Android adjustResize doesn't cause the background
    // illustration to resize when the keyboard opens.
    const [backgroundHeight] = React.useState(() => windowHeight * 0.6);

    const isTablet = width >= 600;
    const panelMaxWidth = isTablet ? 560 : undefined;
    const panelPaddingH = isTablet ? Math.round(width * 0.08) : 32;

    // On Android, adjustResize resizes the window instantly (no animation),
    // which makes the footer jump to its new position. Smooth that layout
    // change so the footer slides with the keyboard instead of snapping.
    // iOS is already smooth via KeyboardAvoidingView's internal LayoutAnimation.
    React.useEffect(() => {
        if (!footer || Platform.OS !== 'android') return;
        const animate = () =>
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const s = Keyboard.addListener('keyboardDidShow', animate);
        const h = Keyboard.addListener('keyboardDidHide', animate);
        return () => {
            s.remove();
            h.remove();
        };
    }, [footer]);

    const skipScale = useSharedValue(1);
    const skipStyle = useAnimatedStyle(() => ({
        transform: [{ scale: skipScale.value }],
    }));

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        useAuthStore.getState().continueAsGuest();
        onSkip ? onSkip() : router.replace('/(tabs)');
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Background illustration — fixed behind everything */}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: backgroundHeight,
                    zIndex: 0,
                }}
            >
                <AuthMedicineBackground />
            </View>

            {/* Skip button — fixed top-right */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: Math.max(insets.top, 20) + 20,
                        right: 24,
                        zIndex: 50,
                    },
                    skipStyle,
                ]}
            >
                <Pressable
                    className="bg-white px-4 py-2 rounded-full flex-row items-center border border-brand-border"
                    accessibilityRole="button"
                    accessibilityLabel="Skip"
                    onPressIn={() => {
                        skipScale.value = withSpring(0.93, { damping: 15, stiffness: 300 });
                    }}
                    onPressOut={() => {
                        skipScale.value = withSpring(1, { damping: 15, stiffness: 300 });
                    }}
                    onPress={handleSkip}
                >
                    <Text className="text-brand-primary font-inter-medium mr-1 leading-none">
                        Skip
                    </Text>
                    <icons.arrow_forward_green width={12} height={12} />
                </Pressable>
            </Animated.View>

            {/*
              KeyboardAvoidingView (iOS only, when a footer is present):
                behavior="padding" → animates its own height reduction by the keyboard
                height, synced to the keyboard's native curve/duration via internal
                LayoutAnimation. The ScrollView (flex:1) absorbs the shrink.
                The footer (flex sibling below ScrollView) naturally sits at the
                bottom of the shrunken KAV = directly above the keyboard.

              Android: adjustResize handles window resizing at the OS level,
                so behavior is left undefined. The footer rides to the new window
                bottom automatically. LayoutAnimation (above) smooths the snap.
            */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' && !!footer ? 'padding' : undefined}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                    style={{ flex: 1 }}
                >
                    <Pressable onPress={Keyboard.dismiss} style={{ flexGrow: 1 }}>
                        {/* Spacer pushes the white panel down behind the illustration */}
                        <View
                            style={{
                                height: backgroundHeight - 24,
                                backgroundColor: 'transparent',
                            }}
                        />

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
                            <View
                                style={{
                                    flexGrow: 1,
                                    paddingTop: 32,
                                    paddingBottom: footer ? 0 : insets.bottom + 24,
                                }}
                            >
                                {children}
                            </View>
                        </View>
                    </Pressable>
                </ScrollView>

                {/*
                  Footer — flex sibling after ScrollView.
                  Sits at the bottom of the KAV at all times. When the keyboard
                  opens, the KAV shrinks (iOS) or the window shrinks (Android),
                  and this block rides up naturally without any extra logic.
                */}
                {footer && (
                    <View
                        style={{
                            backgroundColor: 'white',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingHorizontal: panelPaddingH,
                            paddingTop: 12,
                            paddingBottom: insets.bottom + 12,
                            maxWidth: panelMaxWidth,
                            width: '100%',
                            alignSelf: 'center',
                        }}
                    >
                        {footer}
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};
