import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { HOME_IMAGES } from '@/src/constants/images';
import { useWalletLogs } from '@/src/hooks/queries/useWallet';
import { Transaction, TxIconType, WalletLog } from '@/src/types/wallet';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { Touchable } from '@/src/components/ui/Touchable';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,'0')} ${MONTH[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
}

const TITLE_MAP: Record<string, string> = {
    signup_bonus:      'Welcome Bonus',
    order_purchase:    'Medicine Purchase',
    order_refund:      'Refund Received',
    admin_adjustment:  'Wallet Adjustment',
    wallet_topup:      'Added to Wallet',
};

function logToTransactions(log: WalletLog): Transaction[] {
    const isCredit  = log.type === 'credit';
    const walletAmt = Number(log.walletAmount);
    const coinsAmt  = Number(log.coinsAmount);
    const title     = log.description ?? TITLE_MAP[log.referenceType] ?? 'Transaction';
    const date      = formatDate(log.createdAt);
    const results: Transaction[] = [];

    if (walletAmt > 0) {
        results.push({
            id:          `${log.id}_wallet`,
            iconType:    log.referenceType === 'wallet_topup' ? 'cash' : isCredit ? 'plus' : 'bag',
            title,
            date,
            amount:      `${isCredit ? '+' : '-'}₹${walletAmt.toFixed(0)}`,
            amountColor: isCredit ? '#0F9D58' : '#222222',
            isCoin:      false,
        });
    }

    if (coinsAmt > 0) {
        results.push({
            id:          `${log.id}_coins`,
            iconType:    (isCredit || log.referenceType === 'signup_bonus') ? 'coin_credit' : 'coin_debit',
            title,
            date,
            amount:      `${(isCredit || log.referenceType === 'signup_bonus') ? '+' : '-'}${coinsAmt}`,
            amountColor: (isCredit || log.referenceType === 'signup_bonus') ? '#F59E0B' : '#222222',
            isCoin:      true,
        });
    }

    return results;
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

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

// ─── Row ──────────────────────────────────────────────────────────────────────

const TxRow: React.FC<{ tx: Transaction; isLast: boolean }> = ({ tx, isLast }) => (
    <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}>
            <TransactionIcon type={tx.iconType} />
            <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{tx.title}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{tx.date}</Text>
            </View>
            {tx.isCoin ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Image source={HOME_IMAGES.dollarCoins} style={{ width: 16, height: 16 }} resizeMode="contain" />
                    <Text style={{ fontSize: 14, fontWeight: '700', color: tx.amountColor }}>{tx.amount}</Text>
                </View>
            ) : (
                <Text style={{ fontSize: 14, fontWeight: '700', color: tx.amountColor }}>{tx.amount}</Text>
            )}
        </View>
        {!isLast && <View style={{ height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 20 }} />}
    </View>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['All', 'Debited', 'Credited'] as const;
type Tab = typeof TABS[number];

// ─── Layout ───────────────────────────────────────────────────────────────────

export const WalletHistoryLayout: React.FC = () => {
    const adjustedBottom = useAdjustedBottomInset();
    const [activeTab, setActiveTab] = useState<Tab>('All');
    const { logs, loading } = useWalletLogs(50, 0);

    const all = logs.flatMap(logToTransactions);
    const filtered = activeTab === 'All'
        ? all
        : activeTab === 'Debited'
        ? all.filter(tx => tx.amount.startsWith('-'))
        : all.filter(tx => tx.amount.startsWith('+'));

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FB' }}>
            <ScreenHeader title="Transaction History" backgroundColor="#FFFFFF" showBorder />

            {/* Tabs */}
            <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                {TABS.map(tab => (
                    <Touchable
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.8}
                        style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}
                    >
                        <Text style={{
                            fontSize: 14,
                            fontWeight: activeTab === tab ? '700' : '500',
                            color: activeTab === tab ? '#0F7635' : '#6B7280',
                        }}>
                            {tab}
                        </Text>
                        {activeTab === tab && (
                            <View
                            style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: "#0F7635",
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    marginHorizontal: 20,
                  }}
                              />
                        )}
                    </Touchable>
                ))}
            </View>

            {/* List */}
            {loading ? (
                <ActivityIndicator color="#0F7635" style={{ marginTop: 40 }} />
            ) : filtered.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#9CA3AF', fontWeight: '500', fontSize: 14, marginTop: 40 }}>
                    No transactions
                </Text>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: adjustedBottom + 24, backgroundColor: '#FFFFFF' }}
                >
                    {filtered.map((tx, idx) => (
                        <TxRow key={tx.id} tx={tx} isLast={idx === filtered.length - 1} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};
