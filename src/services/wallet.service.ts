import { walletApi } from "../api/wallet.api";

export const walletService = {
  getBalance: () => walletApi.getBalance(),
  getLogs: (limit?: number, offset?: number) =>
    walletApi.getLogs(limit, offset),
};
