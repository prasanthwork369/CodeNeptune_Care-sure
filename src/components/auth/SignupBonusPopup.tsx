import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { usePathname } from 'expo-router';
import { icons } from '@/src/constants/icons';
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
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(testMode);
    const [bonusData, setBonusData] = useState<BonusData | null>(
        testMode ? { wallet: 100, coins: 50 } : null
    );
    const [showConfetti, setShowConfetti] = useState(testMode);
    const confettiRef = useRef<LottieView>(null);

    useEffect(() => {
        if (testMode) return;

        if (!isAuthenticated || !user?.id) return;

        // Wait until we've actually landed on the Home screen before
        // checking/showing the bonus — avoids it popping up mid-navigation
        // (OTP screen -> Home transition).
        if (pathname !== '/') return;

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
    }, [isAuthenticated, user?.id, pathname]);

    const hasWallet = bonusData && bonusData.wallet > 0;
    const hasCoins = bonusData && bonusData.coins > 0;

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            statusBarTranslucent
            navigationBarTranslucent
            onRequestClose={() => { setIsOpen(false); onClose?.(); }}
        >
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
                <LinearGradient
                    colors={['#FDF5FF', '#F3F9FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: '100%', borderRadius: 24, overflow: 'hidden' }}
                >
                    {/* Header */}
                    <View style={{ paddingHorizontal: 24, paddingTop: 26, paddingBottom: 8 }}>
                        <Text className="font-medium text-[#222222]" style={{ fontSize: 13 }}>
                            Hi there!
                        </Text>
                        <Text className="font-inter-bold text-[#1A1C1E]" style={{ fontSize: 22, marginTop: 2, maxWidth: 220 }}>
                            Welcome to CareSure
                        </Text>
                        <Text className="font-inter text-[#9CA3AF]" style={{ fontSize: 13, marginTop: 4, maxWidth: 220 }}>
                            You&apos;ve got rewards waiting for you
                        </Text>

                        <Image
                            source={HOME_IMAGES.bonusGift}
                            style={{ position: 'absolute', top: 6, right: 0, width: 110, height: 100 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Wallet card */}
                    <View
                        style={{
                            marginHorizontal: 16,
                            marginTop: 8,
                            marginBottom: 16,
                            backgroundColor: '#fff',
                            borderRadius: 20,
                            padding: 16,
                            shadowColor: '#919EAB',
                            shadowOffset: { width: 0, height: 6 },
                            shadowOpacity: 0.12,
                            shadowRadius: 16,
                            elevation: 4,
                        }}
                    >
                        <Text className="font-inter-bold text-[#1A1C1E]" style={{ fontSize: 15, marginBottom: 12 }}>
                            Your Wallet
                        </Text>

                        <View className="flex-row" style={{ gap: 12, marginBottom: 18 }}>
                            {hasCoins && (
                                <View style={{ flex: 1, backgroundColor: '#FFF8EC', borderRadius: 16, padding: 14 }}>
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            backgroundColor: 'rgba(245,166,35,0.12)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Image source={HOME_IMAGES.rupeeCoin} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                    </View>
                                    <Text className="font-inter-semibold text-[#9CA3AF]" style={{ fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>
                                        COINS
                                    </Text>
                                    <Text className="font-inter-bold text-[#F5A623]" style={{ fontSize: 26, lineHeight: 30 }}>
                                        {bonusData!.coins}
                                    </Text>
                                    <Text className="font-inter text-[#9CA3AF]" style={{ fontSize: 11, marginTop: 4 }}>
                                        1 coin = ₹1
                                    </Text>
                                </View>
                            )}

                            {hasWallet && (
                                <View style={{ flex: 1, backgroundColor: '#EAFBF0', borderRadius: 16, padding: 14 }}>
                                    <View
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 10,
                                            backgroundColor: 'rgba(15,118,53,0.10)',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 10,
                                        }}
                                    >
                                        <Image source={HOME_IMAGES.cash} style={{ width: 20, height: 20 }} resizeMode="contain" />
                                    </View>
                                    <Text className="font-inter-semibold text-[#9CA3AF]" style={{ fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>
                                        BALANCE
                                    </Text>
                                    <Text className="font-inter-bold text-[#1A1C1E]" style={{ fontSize: 26, lineHeight: 30 }}>
                                        ₹{Number(bonusData!.wallet).toFixed(0)}
                                    </Text>
                                    <Text className="font-inter text-[#9CA3AF]" style={{ fontSize: 11, marginTop: 4 }}>
                                        Available to Spend
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Feature highlights */}
                        <LinearGradient
                            colors={['#FDF5FF', '#F3F9FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ borderRadius: 16, marginTop: 4 }}
                        >
                        <View
                            className="flex-row"
                            style={{ paddingVertical: 16, paddingHorizontal: 12 }}
                        >
                            <View className="flex-1 items-center">
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: '#FDF5FF',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 6,
                                    }}
                                >
                                    <icons.bonus_coins width={16} height={18} />
                                </View>
                                <Text className="font-inter-semibold text-[#1A1C1E] text-center" style={{ fontSize: 12 }}>
                                    Earn coins
                                </Text>
                                <Text className="font-inter text-[#9CA3AF] text-center" style={{ fontSize: 10, marginTop: 2 }}>
                                    on every order
                                </Text>
                            </View>

                            <View style={{ width: 1, backgroundColor: '#F0F0F0', marginHorizontal: 6 }} />

                            <View className="flex-1 items-center">
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: '#FFF8EC',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 6,
                                    }}
                                >
                                    <icons.bonus_discount width={18} height={12} />
                                </View>
                                <Text className="font-inter-semibold text-[#1A1C1E] text-center" style={{ fontSize: 12 }}>
                                    Use coins
                                </Text>
                                <Text className="font-inter text-[#9CA3AF] text-center" style={{ fontSize: 10, marginTop: 2 }}>
                                    for discounts
                                </Text>
                            </View>

                            <View style={{ width: 1, backgroundColor: '#F0F0F0', marginHorizontal: 6 }} />

                            <View className="flex-1 items-center">
                                <View
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 10,
                                        backgroundColor: '#FFF8EC',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 6,
                                    }}
                                >
                                    <icons.bonus_gift width={16} height={16} />
                                </View>
                                <Text className="font-inter-semibold text-[#1A1C1E] text-center" style={{ fontSize: 12 }}>
                                    More benefits
                                </Text>
                                <Text className="font-inter text-[#9CA3AF] text-center" style={{ fontSize: 10, marginTop: 2 }}>
                                    exclusive for you
                                </Text>
                            </View>
                        </View>
                        </LinearGradient>
                    </View>

                    {/* CTA */}
                    <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
                        <Touchable
                            onPress={() => { setIsOpen(false); onClose?.(); }}
                            activeOpacity={0.85}
                            className="w-full items-center"
                            style={{ backgroundColor: '#0F7635', paddingVertical: 14, borderRadius: 12 }}
                        >
                            <Text className="font-inter-bold text-white" style={{ fontSize: 15 }}>
                                Start Shopping
                            </Text>
                        </Touchable>
                    </View>
                </LinearGradient>

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
