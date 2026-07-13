import { create } from "zustand";
import { AlertButton, AlertDialogProps } from "@/src/components/ui/AlertDialog";

export interface GlobalAlertConfig {
  title: string;
  icon: AlertDialogProps['icon'];
  buttons: AlertButton[];
}

interface UIState {
  isTabBarVisible: boolean;
  isUploadButtonCollapsed: boolean;
  hasJustUploadedPrescription: boolean;
  isRxFromCartFlow: boolean;
  /** True while the home feed is being scrolled/flung. Kept in the store (not
   * HomeLayout state) so toggling it only re-renders the few components that
   * subscribe to it (banner autoplays) instead of the whole feed list. */
  isFeedScrolling: boolean;
  /** True once the home onboarding permission flow (location → notification)
   * has finished. The SignupBonusPopup waits for this so it never overlaps a
   * permission dialog. */
  permissionFlowComplete: boolean;
  setTabBarVisible: (visible: boolean) => void;
  setUploadButtonCollapsed: (collapsed: boolean) => void;
  setHasJustUploadedPrescription: (uploaded: boolean) => void;
  setIsRxFromCartFlow: (value: boolean) => void;
  setFeedScrolling: (value: boolean) => void;
  setPermissionFlowComplete: (value: boolean) => void;
  globalAlert: GlobalAlertConfig | null;
  setGlobalAlert: (alert: GlobalAlertConfig | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTabBarVisible: true,
  isUploadButtonCollapsed: false,
  hasJustUploadedPrescription: false,
  isRxFromCartFlow: false,
  isFeedScrolling: false,
  permissionFlowComplete: false,
  setTabBarVisible: (visible) => set({ isTabBarVisible: visible }),
  setUploadButtonCollapsed: (collapsed) =>
    set({ isUploadButtonCollapsed: collapsed }),
  setHasJustUploadedPrescription: (uploaded) =>
    set({ hasJustUploadedPrescription: uploaded }),
  setIsRxFromCartFlow: (value) => set({ isRxFromCartFlow: value }),
  setFeedScrolling: (value) => set({ isFeedScrolling: value }),
  setPermissionFlowComplete: (value) => set({ permissionFlowComplete: value }),
  globalAlert: null,
  setGlobalAlert: (alert) => set({ globalAlert: alert }),
}));
