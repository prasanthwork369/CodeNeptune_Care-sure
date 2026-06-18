import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { useWalletBalance, useAddMoney } from '@/src/hooks/queries/useWallet';
import { useNav } from '@/src/hooks/useNav';
import { ANIMATIONS } from '@/src/constants/images';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRESETS = [500, 1000, 2000];
const MAX_TOPUP = 2000;

export const AddMoneyLayout: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [isAmountFocused, setIsAmountFocused] = useState(false);
    const { balance, loading: balanceLoading } = useWalletBalance();
    // useQuery reports isLoading=false while disabled (pre-auth), so balance
    // can briefly be null with loading=false — treat that as still pending too.
    const isBalancePending = balanceLoading || balance == null;
    const { addMoney, loading } = useAddMoney();
    const router = useNav();
    const confettiRef = useRef<LottieView>(null);
    const inputRef = useRef<TextInput>(null);

    const walletBalance = Number(balance?.walletBalance ?? 0);
    const numericAmount = Math.min(Number(amount) || 0, MAX_TOPUP);
    const selectedPreset = PRESETS.find((p) => p === numericAmount) ?? null;

    const handlePreset = (value: number) => setAmount(String(value));

    const handleAmountChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        setAmount(cleaned);
    };

    const handleProceed = async () => {
        if (!numericAmount || numericAmount > MAX_TOPUP) return;
        try {
            await addMoney(numericAmount);
            confettiRef.current?.play();
            setTimeout(() => router.back(), 2000);
        } catch (err: any) {
            Alert.alert('Failed', err?.message ?? 'Could not add money. Please try again.');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FB' }}>
            <ScreenHeader title="Add Money" backgroundColor="#FFFFFF" showBorder />

            {/* Amount Section */}
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ alignItems: 'center', paddingTop: 36, paddingBottom: 28, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: '#6B7280', marginBottom: 12 }}>
                    How much would you like to add?
                </Text>

                {/* Editable amount input */}
                <Touchable
                    activeOpacity={1}
                    onPress={() => inputRef.current?.focus()}
                    style={{ width: '100%', alignItems: 'center', marginBottom: 6 }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderBottomWidth: 2,
                            borderBottomColor: isAmountFocused ? '#0F7635' : '#E5E7EB',
                            paddingBottom: 4,
                        }}
                    >
                        <Text style={{ fontSize: 44, fontFamily: 'Inter-ExtraBold', color: '#111827' }}>₹</Text>
                        <TextInput
                            ref={inputRef}
                            autoFocus
                            value={amount}
                            onChangeText={handleAmountChange}
                            onFocus={() => setIsAmountFocused(true)}
                            onBlur={() => setIsAmountFocused(false)}
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="number-pad"
                            maxLength={6}
                            cursorColor="#0F7635"
                            selectionColor="#0F7635"
                            style={{
                                fontSize: 44,
                                fontFamily: 'Inter-ExtraBold',
                                color: '#111827',
                                minWidth: 80,
                                padding: 0,
                                includeFontPadding: false,
                             }}
                        />
                    </View>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium', color: isAmountFocused ? '#0F7635' : '#9CA3AF', marginTop: 6 }}>
                        Tap to enter a custom amount
                    </Text>
                </Touchable>

                {isBalancePending ? (
                    <ActivityIndicator color="#0F7635" size="small" style={{ marginBottom: 20 }} />
                ) : (
                    <Text style={{ fontSize: 13, fontFamily: 'Inter-Medium', color: '#6B7280', marginBottom: 20 }}>
                        Available Balance:{' '}
                        <Text style={{ fontFamily: 'Inter-Bold', color: '#111827' }}>
                            ₹{walletBalance.toLocaleString()}
                        </Text>
                    </Text>
                )}

                {/* Preset chips */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                    {PRESETS.map((preset) => {
                        const isActive = selectedPreset === preset;
                        return (
                            <Touchable
                                key={preset}
                                onPress={() => handlePreset(preset)}
                                activeOpacity={0.8}
                                style={{
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    borderWidth: 1.5,
                                    borderColor: isActive ? '#0F7635' : '#E5E7EB',
                                    backgroundColor: isActive ? '#EFFFF5' : '#FFFFFF',
                                }}
                            >
                                <Text style={{
                                    fontSize: 14,
                                    fontFamily: 'Inter-SemiBold',
                                    color: isActive ? '#0F7635' : '#374151',
                                }}>
                                    ₹{preset.toLocaleString()}
                                </Text>
                            </Touchable>
                        );
                    })}
                </View>

                <Text style={{ fontSize: 12, fontFamily: 'Inter-Medium', color: '#9CA3AF' }}>
                    Maximum Top-Up Limit: ₹{MAX_TOPUP.toLocaleString()}
                </Text>
            </ScrollView>

            <View style={{ flex: 1 }} />

            {/* Proceed Button */}
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#F5F6FB' }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
                    <Touchable
                        onPress={handleProceed}
                        disabled={loading || !numericAmount || numericAmount > MAX_TOPUP}
                        activeOpacity={0.85}
                        style={{
                            backgroundColor: '#0F7635',
                            borderRadius: 14,
                            height: 54,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            opacity: (loading || !numericAmount || numericAmount > MAX_TOPUP) ? 0.5 : 1,
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <icons.lock width={18} height={18} fill="#FFFFFF" />
                                <Text style={{ fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#FFFFFF' }}>
                                    Proceed to Pay ₹{numericAmount.toLocaleString()}
                                </Text>
                            </>
                        )}
                    </Touchable>
                </View>
            </SafeAreaView>

            {/* Confetti overlay */}
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}>
                <LottieView
                    ref={confettiRef}
                    source={ANIMATIONS.confetti}
                    autoPlay={false}
                    loop={false}
                    style={{ width: '100%', height: '100%' }}
                />
            </View>
        </View>
    );
};
