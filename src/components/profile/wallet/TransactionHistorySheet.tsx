import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { HOME_IMAGES } from '@/src/constants/images';
import { useNav } from '@/src/hooks/useNav';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import { Image, Text, View } from 'react-native';
import { Transaction, TxIconType } from '@/src/types/wallet';
import { Touchable } from '@/src/components/ui/Touchable';

interface TransactionHistorySheetProps {
    visible: boolean;
    onClose: () => void;
    transactions: Transaction[];
}

const TransactionIcon = ({ type }: { type: TxIconType }) => {
    const isCredit = type === 'plus' || type === 'coin_credit' || type === 'cash';
    const src =
        type === 'coin_credit' ? HOME_IMAGES.coinCredit :
        type === 'coin_debit'  ? HOME_IMAGES.coinDebit  :
        isCredit               ? HOME_IMAGES.accountBalanceCredit :
                                 HOME_IMAGES.accountBalanceDebit;
    return (
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isCredit ? '#DFF3E6' : '#FCE8E8', alignItems: 'center', justifyContent: 'center' }}>
            <Image source={src} style={{ width: 26, height: 26 }} resizeMode="contain" />
        </View>
    );
};

export const TransactionHistorySheet: React.FC<TransactionHistorySheetProps> = ({
    visible,
    onClose,
    transactions,
}) => {
    const router = useNav();

    const handleSeeAll = () => {
        onClose();
        setTimeout(() => router.push('/profile/wallet/history' as any), 300);
    };

    const snapPoints = useMemo(() => ['50%'], []);

    return (
        <GorhomBottomSheet
            isVisible={visible}
            onClose={onClose}
            snapPoints={snapPoints}
            closeButtonOffset="50%"
            backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
            {/* Title */}
            <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                <Text style={{ fontSize: 16, fontFamily: 'Inter-Bold', color: '#111827' }}>Transaction History</Text>
            </View>

            {/* Rows */}
            <BottomSheetScrollView showsVerticalScrollIndicator={false} bounces={false} style={{ flex: 1 }}>
                {transactions.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'Inter-Medium', fontSize: 14, paddingVertical: 32 }}>
                        No transactions yet
                    </Text>
                ) : (
                    transactions.map((tx, idx) => (
                        <View key={tx.id}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}>
                                <TransactionIcon type={tx.iconType} />
                                <View style={{ flex: 1, marginLeft: 14 }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#111827' }}>{tx.title}</Text>
                                    <Text style={{ fontSize: 12, fontFamily: 'Inter', color: '#6B7280', marginTop: 2 }}>{tx.date}</Text>
                                </View>
                                {tx.isCoin ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Image source={HOME_IMAGES.dollarCoins} style={{ width: 16, height: 16 }} resizeMode="contain" />
                                        <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: tx.amountColor }}>{tx.amount}</Text>
                                    </View>
                                ) : (
                                    <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: tx.amountColor }}>{tx.amount}</Text>
                                )}
                            </View>
                            {idx < transactions.length - 1 && (
                                <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 20 }} />
                            )}
                        </View>
                    ))
                )}
            </BottomSheetScrollView>

            {/* See All */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 16, alignItems: 'center' }}>
                <Touchable onPress={handleSeeAll} activeOpacity={0.7}>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#FF8A00' }}>See All</Text>
                </Touchable>
            </View>
        </GorhomBottomSheet>
    );
};
