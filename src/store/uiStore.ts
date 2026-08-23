import type { ImageSource } from "expo-image";
import { create } from "zustand";
import { withTiming } from "react-native-reanimated";
import { feedScrolling } from "@/src/store/feedScrolling";
import { tabBarVisible } from "@/src/store/tabBarVisibility";
import { durations, easings } from "@/src/theme";

export interface GlobalAlertConfig {
  title: string;
  message: string;
  icon: ImageSource;
  iconBg?: string;
  confirmBg?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

interface UIState {
  isTabBarVisible: boolean;
  isUploadButtonCollapsed: boolean;
  hasJustUploadedPrescription: boolean;
  isRxFromCartFlow: boolean;
  /** True when the home feed is scrolling. Store-driven to prevent full feed re-renders. */
  isFeedScrolling: boolean;
  /** True when the Home tab is focused. Prevents re-rendering all feed item cells. */
  isHomeFocused: boolean;
  /** True after the splash curtain hides */
  isAppRevealed: boolean;
  /** True after the home onboarding permission dialog flow completes */
  permissionFlowComplete: boolean;
  setTabBarVisible: (visible: boolean) => void;
  setUploadButtonCollapsed: (collapsed: boolean) => void;
  setHasJustUploadedPrescription: (uploaded: boolean) => void;
  setIsRxFromCartFlow: (value: boolean) => void;
  setFeedScrolling: (value: boolean) => void;
  setHomeFocused: (value: boolean) => void;
  setAppRevealed: (value: boolean) => void;
  setPermissionFlowComplete: (value: boolean) => void;
  globalAlert: GlobalAlertConfig | null;
  setGlobalAlert: (alert: GlobalAlertConfig | null) => void;
  suppressNetworkToast: boolean;
  setSuppressNetworkToast: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isTabBarVisible: true,
  isUploadButtonCollapsed: false,
  hasJustUploadedPrescription: false,
  isRxFromCartFlow: false,
  isFeedScrolling: false,
  isHomeFocused: true,
  isAppRevealed: false,
  permissionFlowComplete: false,
  // Update shared value directly to trigger tab bar animation
  setTabBarVisible: (visible) => {
    tabBarVisible.value = withTiming(visible ? 1 : 0, {
      duration: durations.tabBar,
      easing: easings.standard,
    });
    set({ isTabBarVisible: visible });
  },
  setUploadButtonCollapsed: (collapsed) =>
    set({ isUploadButtonCollapsed: collapsed }),
  setHasJustUploadedPrescription: (uploaded) =>
    set({ hasJustUploadedPrescription: uploaded }),
  setIsRxFromCartFlow: (value) => set({ isRxFromCartFlow: value }),
  // Update shared value directly to trigger animation pauses
  setFeedScrolling: (value) => {
    feedScrolling.value = value;
    set({ isFeedScrolling: value });
  },
  setHomeFocused: (value) => set({ isHomeFocused: value }),
  setAppRevealed: (value) => set({ isAppRevealed: value }),
  setPermissionFlowComplete: (value) => set({ permissionFlowComplete: value }),
  globalAlert: null,
  setGlobalAlert: (alert) => set({ globalAlert: alert }),
  suppressNetworkToast: false,
  setSuppressNetworkToast: (value) => set({ suppressNetworkToast: value }),
}));
