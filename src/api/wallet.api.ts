import { API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';
import { WalletBalance, WalletLog, AddMoneyPayload, WalletBalanceResponse } from '../types/wallet';

export const walletApi = {
    getBalance: async (): Promise<WalletBalance> => {
        const response = await apiClient.get(API_ENDPOINTS.WALLET_BALANCE);
        return response.data.data;
    },

    getLogs: async (limit: number = 10, offset: number = 0): Promise<WalletLog[]> => {
        const response = await apiClient.get(API_ENDPOINTS.WALLET_LOGS, {
            params: { limit, offset },
        });
        return response.data.data;
    },

    addMoney: async (payload: AddMoneyPayload): Promise<WalletBalanceResponse> => {
        const { data } = await apiClient.post(API_ENDPOINTS.WALLET_TOPUP, payload);
        return data.data as WalletBalanceResponse;
    },
};
