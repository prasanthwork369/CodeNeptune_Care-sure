import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type {
  AddMoneyPayload,
  WalletBalance,
  WalletBalanceResponse,
  WalletLog,
} from "../types/api.types";

export const walletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const response = await apiClient.get(API_ENDPOINTS.WALLET_BALANCE);
    const raw = response.data.data;
    // Backend names the corporate credits field walletCreditsBalance.
    return {
      ...raw,
      corporateCredits: raw.walletCreditsBalance,
    };
  },

  getLogs: async (
    limit: number = 10,
    offset: number = 0,
  ): Promise<WalletLog[]> => {
    const response = await apiClient.get(API_ENDPOINTS.WALLET_LOGS, {
      params: { limit, offset },
    });
    return response.data.data;
  },

  addMoney: async (
    payload: AddMoneyPayload,
  ): Promise<WalletBalanceResponse> => {
    const { data } = await apiClient.post(API_ENDPOINTS.WALLET_TOPUP, payload);
    return data.data as WalletBalanceResponse;
  },
};
