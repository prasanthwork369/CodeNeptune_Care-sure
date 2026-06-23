export type TxIconType = 'plus' | 'bag' | 'coin_debit' | 'coin_credit' | 'cash';

export interface WalletLog {
    id: string;
    customerId: string;
    type: 'credit' | 'debit';
    walletAmount: number | string;
    coinsAmount: number;
    referenceType: 'signup_bonus' | 'order_purchase' | 'order_refund' | 'admin_adjustment' | 'wallet_topup';
    referenceId: string | null;
    description: string | null;
    createdAt: string;
    typeCode?: number;
    referenceTypeCode?: number;
}

export interface WalletBalance {
    id: string;
    customerId: string;
    walletBalance: number | string;
    coinsBalance: number;
    walletCreditsBalance?: number | string;
    corporateCredits?: number | string;
    createdAt: string;
    updatedAt: string;
}

export interface AddMoneyPayload {
    amount: number;
}

export interface WalletBalanceResponse extends WalletBalance {}

export type Transaction = {
    id: string;
    iconType: TxIconType;
    title: string;
    date: string;
    amount: string;
    amountColor: string;
    isCoin: boolean;
};
