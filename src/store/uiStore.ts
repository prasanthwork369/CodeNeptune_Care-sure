import { create } from "zustand";

interface UIState {
  isTabBarVisible: boolean;
  isUploadButtonCollapsed: boolean;
  hasJustUploadedPrescription: boolean;
  isRxFromCartFlow: boolean;
  /** True once the home onboarding permission flow (location → notification)
   * has finished. The SignupBonusPopup waits for this so it never overlaps a
   * permission dialog. */
  permissionFlowComplete: boolean;
  setTabBarVisible: (visible: boolean) => void;
  setUploadButtonCollapsed: (collapsed: boolean) => void;
  setHasJustUploadedPrescription: (uploaded: boolean) => void;
  setIsRxFromCartFlow: (value: boolean) => void;
  setPermissionFlowComplete: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTabBarVisible: true,
  isUploadButtonCollapsed: false,
  hasJustUploadedPrescription: false,
  isRxFromCartFlow: false,
  permissionFlowComplete: false,
  setTabBarVisible: (visible) => set({ isTabBarVisible: visible }),
  setUploadButtonCollapsed: (collapsed) =>
    set({ isUploadButtonCollapsed: collapsed }),
  setHasJustUploadedPrescription: (uploaded) =>
    set({ hasJustUploadedPrescription: uploaded }),
  setIsRxFromCartFlow: (value) => set({ isRxFromCartFlow: value }),
  setPermissionFlowComplete: (value) => set({ permissionFlowComplete: value }),
}));
