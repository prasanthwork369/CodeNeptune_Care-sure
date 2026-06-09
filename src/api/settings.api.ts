import { API_BASE_URL, API_ENDPOINTS } from '../utils/urls';
import { apiClient } from './client';
import axios from 'axios';

export interface MobileAppLinks {
    termsLink: string;
    refundLink: string;
    privacyLink: string;
}

export interface CartWalletSettings {
  cart: {
    freeDeliveryAbove: number;
    standardDeliveryCharge: number;
    expressDeliveryCharge: number;
    handlingCharge: number;
    maxCartItems: number;
  };
  wallet: {
    walletSignupBonus: number;
    coinsSignupBonus: number;
    isWalletBonusActive: boolean;
    isCoinsBonusActive: boolean;
    coinValueInRupees: number;
    coinUsagePercentage: number;
  };
}

// Public axios instance — no auth headers, used for endpoints accessible without login
const publicAxios = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json', 'x-panel-id': 'customer' },
});

export const settingsApi = {
    getMobileAppLinks: async (): Promise<MobileAppLinks> => {
        const response = await publicAxios.get(API_ENDPOINTS.SETTINGS_MOBILE_APP_LINKS);
        const d = response.data.data ?? response.data ?? {};
        // Normalise snake_case → camelCase in case the backend returns snake_case
        return {
            termsLink:   d.termsLink   ?? d.terms_link   ?? d.terms   ?? '',
            refundLink:  d.refundLink  ?? d.refund_link  ?? d.refund  ?? '',
            privacyLink: d.privacyLink ?? d.privacy_link ?? d.privacy ?? '',
        };
    },

    getCartWalletSettings: async (): Promise<CartWalletSettings> => {
        const response = await apiClient.get(API_ENDPOINTS.SETTINGS_CART_WALLET);
        return response.data.data;
    },
};
