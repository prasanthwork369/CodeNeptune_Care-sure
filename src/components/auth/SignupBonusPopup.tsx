import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { ANIMATIONS, HOME_IMAGES } from '@/src/constants/images';
import { useAuthStore } from '@/src/store/authStore';
import { walletService } from '@/src/services/wallet.service';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BONUS_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface BonusData {
    wallet: number;
    coins: number;
}

interface Props {
    testMode?: boolean;
    onClose?: () => void;
}

export const SignupBonusPopup: React.FC<Props> = ({ testMode = false, onClose }) => {
    const { isAuthenticated, user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(testMode);
    const [bonusData, setBonusData] = useState<BonusData | null>(
        testMode ? { wallet: 100, coins: 50 } : null
    );
    const [showConfetti, setShowConfetti] = useState(testMode);
    const confettiRef = useRef<LottieView>(null);

    useEffect(() => {
        if (testMode) return;

        if (!isAuthenticated || !user?.id) return;

        let cancelled = false;
        let confettiTimer: ReturnType<typeof setTimeout> | null = null;

        const checkBonus = async () => {
            const storageKey = `caresure.bonus.shown.${user.id}`;
            const alreadyShown = await SecureStore.getItemAsync(storageKey);
            if (alreadyShown || cancelled) return;

            try {
                const logs = await walletService.getLogs(5, 0);
                if (cancelled) return;

                const signupLog = logs.find((log) => log.referenceType === 'signup_bonus');

                if (signupLog) {
                    const age = Date.now() - new Date(signupLog.createdAt).getTime();
                    if (age < BONUS_WINDOW_MS) {
                        setBonusData({
                            wallet: Number(signupLog.walletAmount),
                            coins: Number(signupLog.coinsAmount),
                        });
                        setShowConfetti(true);
                        setIsOpen(true);
                        confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
                    }
                    await SecureStore.setItemAsync(storageKey, 'true');
                }
            } catch (err) {
                if (__DEV__) console.error('[SignupBonusPopup] failed to check wallet logs', err);
            }
        };

        checkBonus();

        return () => {
            cancelled = true;
            if (confettiTimer) clearTimeout(confettiTimer);
        };
    }, [isAuthenticated, user?.id]);

    const hasWallet = bonusData && bonusData.wallet > 0;
    const hasCoins = bonusData && bonusData.coins > 0;

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={() => { setIsOpen(false); onClose?.(); }}
        >
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                    <View
                        className="bg-white w-full items-center overflow-hidden"
                        style={{ borderRadius: 24, paddingHorizontal: 28, paddingTop: 28, paddingBottom: 28 }}
                    >
                        {/* Top accent bar */}
                        <LinearGradient
                            colors={['#f5a623', '#00b344', '#00703c']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }}
                        />

                        {/* Celebration icon */}
                        <View
                            style={{
                                width: 82,
                                height: 82,
                                borderRadius: 41,
                                backgroundColor: '#e8f8ed',
                                borderWidth: 1,
                                borderColor: '#c3e3cc',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 18,
                                marginTop: 8,
                            }}
                        >
                            <Text style={{ fontSize: 38 }}>🎉</Text>
                        </View>

                        {/* Heading */}
                        <Text
                            className="font-inter-bold text-[#1A1C1E] text-center"
                            style={{ fontSize: 20, marginBottom: 4 }}
                        >
                            Welcome to CareSure!
                        </Text>
                        <Text
                            className="font-inter text-[#6A6A6A] text-center"
                            style={{ fontSize: 13, lineHeight: 20, marginBottom: 22, maxWidth: 280 }}
                        >
                            Your account is set up and we&apos;ve credited a special signup bonus straight into your wallet.
                        </Text>

                        {/* Bonus cards */}
                        <View className="flex-row w-full" style={{ gap: 12, marginBottom: 20 }}>
                            {hasWallet && (
                                <View
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#f0faf2',
                                        borderWidth: 1,
                                        borderColor: '#c5e8d0',
                                        borderRadius: 16,
                                        paddingVertical: 16,
                                        paddingHorizontal: 12,
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            backgroundColor: 'rgba(0,112,60,0.10)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 2,
                                        }}
                                    >
                                        <Image source={HOME_IMAGES.wallet} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                    </View>
                                    <Text className="font-inter-bold text-[#00703c]" style={{ fontSize: 10, letterSpacing: 1 }}>
                                        WALLET CASH
                                    </Text>
                                    <Text className="font-inter-bold text-[#1A1C1E]" style={{ fontSize: 26, lineHeight: 30 }}>
                                        ₹{Number(bonusData!.wallet).toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            {hasCoins && (
                                <View
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#fffaf0',
                                        borderWidth: 1,
                                        borderColor: '#fce9ca',
                                        borderRadius: 16,
                                        paddingVertical: 16,
                                        paddingHorizontal: 12,
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            backgroundColor: 'rgba(245,166,35,0.10)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 2,
                                        }}
                                    >
                                        <Image source={HOME_IMAGES.dollarCoins} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                    </View>
                                    <Text className="font-inter-bold text-[#e08900]" style={{ fontSize: 10, letterSpacing: 1 }}>
                                        CARESURE COINS
                                    </Text>
                                    <Text className="font-inter-bold text-[#1A1C1E]" style={{ fontSize: 26, lineHeight: 30 }}>
                                        {bonusData!.coins}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Info line */}
                        <Text
                            className="font-inter text-[#9E9E9E] text-center"
                            style={{ fontSize: 11, marginBottom: 20 }}
                        >
                            Your balance is ready to use on your next order
                        </Text>

                        {/* CTA */}
                        <Touchable
                            onPress={() => { setIsOpen(false); onClose?.(); }}
                            activeOpacity={0.85}
                            className="w-full items-center"
                            style={{ backgroundColor: '#00703c', paddingVertical: 14, borderRadius: 12 }}
                        >
                            <Text className="font-inter-bold text-white" style={{ fontSize: 15 }}>
                                Start Shopping
                            </Text>
                        </Touchable>
                    </View>

                {/* Confetti — rendered AFTER card so it paints on top */}
                {showConfetti && (
                    <View
                        pointerEvents="none"
                        style={{ position: 'absolute', top: 0, left: 0, width: SCREEN_W, height: SCREEN_H }}
                    >
                        <LottieView
                            ref={confettiRef}
                            source={ANIMATIONS.confetti}
                            autoPlay
                            loop={false}
                            resizeMode="cover"
                            style={{ width: SCREEN_W, height: SCREEN_H }}
                        />
                    </View>
                )}
                </View>
            </Modal>
    );
};
