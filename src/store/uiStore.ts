import { create } from "zustand";

interface UIState {
  isTabBarVisible: boolean;
  isUploadButtonCollapsed: boolean;
  hasJustUploadedPrescription: boolean;
  isRxFromCartFlow: boolean;
  setTabBarVisible: (visible: boolean) => void;
  setUploadButtonCollapsed: (collapsed: boolean) => void;
  setHasJustUploadedPrescription: (uploaded: boolean) => void;
  setIsRxFromCartFlow: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTabBarVisible: true,
  isUploadButtonCollapsed: false,
  hasJustUploadedPrescription: false,
  isRxFromCartFlow: false,
  setTabBarVisible: (visible) => set({ isTabBarVisible: visible }),
  setUploadButtonCollapsed: (collapsed) =>
    set({ isUploadButtonCollapsed: collapsed }),
  setHasJustUploadedPrescription: (uploaded) =>
    set({ hasJustUploadedPrescription: uploaded }),
  setIsRxFromCartFlow: (value) => set({ isRxFromCartFlow: value }),
}));
