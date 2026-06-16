import { AuthMedicineBackground } from '@/src/components/auth/AuthMedicineBackground';
import { icons } from '@/src/constants/icons';
import { useAuthStore } from '@/src/store/authStore';
import * as Haptics from 'expo-haptics';
import { useNav } from '@/src/hooks/useNav';
import React from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
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
    children?: React.ReactNode;
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

    const [backgroundHeight] = React.useState(() => windowHeight * 0.6);

    const isTablet = width >= 600;
    const panelMaxWidth = isTablet ? 560 : undefined;
    const panelPaddingH = isTablet ? Math.round(width * 0.08) : 32;
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

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <Pressable onPress={Keyboard.dismiss} style={{ flexGrow: 1 }}>
                        {/* Flexible spacer — shrinks when KAV/resize compresses the container */}
                        <View style={{ flex: 1, minHeight: backgroundHeight * 0.3 }} />

                        {/* White panel — always at bottom, rides up as spacer shrinks */}
                        <View
                            style={{
                                backgroundColor: 'white',
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                paddingHorizontal: panelPaddingH,
                                maxWidth: panelMaxWidth,
                                width: '100%',
                                alignSelf: 'center',
                                paddingTop: 32,
                                paddingBottom: footer ? 0 : insets.bottom + 24,
                            }}
                        >
                            {children}
                        </View>

                        {footer && (
                            <View
                                style={{
                                    backgroundColor: 'white',
                                    paddingHorizontal: panelPaddingH,
                                    paddingBottom: insets.bottom + 16,
                                    maxWidth: panelMaxWidth,
                                    width: '100%',
                                    alignSelf: 'center',
                                }}
                            >
                                {footer}
                            </View>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};
