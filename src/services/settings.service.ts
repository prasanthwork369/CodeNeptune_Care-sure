import { settingsApi } from "../api/settings.api";

export const settingsService = {
  getMobileAppLinks: () => settingsApi.getMobileAppLinks(),
  getCartWalletSettings: () => settingsApi.getCartWalletSettings(),
  getSettings: () => settingsApi.getSettings(),
  getPaymentSettings: () => settingsApi.getPaymentSettings(),
  getUploadConfig: () => settingsApi.getUploadConfig(),
};
