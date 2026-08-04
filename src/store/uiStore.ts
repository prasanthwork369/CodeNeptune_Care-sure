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
  /** True while the home feed is being scrolled/flung. Kept in the store (not
   * HomeLayout state) so toggling it only re-renders the few components that
   * subscribe to it (banner autoplays) instead of the whole feed list. */
  isFeedScrolling: boolean;
  /** True while the Home tab is the focused screen. Kept here (not HomeLayout
   * state) so focus changes don't invalidate the feed's renderItem and
   * re-render every mounted cell — only the carousels that pause on blur. */
  isHomeFocused: boolean;
  /** True once the home onboarding permission flow (location → notification)
   * has finished. The SignupBonusPopup waits for this so it never overlaps a
   * permission dialog. */
  permissionFlowComplete: boolean;
  setTabBarVisible: (visible: boolean) => void;
  setUploadButtonCollapsed: (collapsed: boolean) => void;
  setHasJustUploadedPrescription: (uploaded: boolean) => void;
  setIsRxFromCartFlow: (value: boolean) => void;
  setFeedScrolling: (value: boolean) => void;
  setHomeFocused: (value: boolean) => void;
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
  isHomeFocused: true,
  permissionFlowComplete: false,
  // Also drives the shared value, since that — not this flag — is what the bar
  // animates from. The scroll worklet writes the shared value itself and calls
  // setState directly, so it never round-trips through here.
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
  // Drives the shared value too — that, not this flag, is what the decorative
  // shimmers read, so pausing them costs no re-render.
  setFeedScrolling: (value) => {
    feedScrolling.value = value;
    set({ isFeedScrolling: value });
  },
  setHomeFocused: (value) => set({ isHomeFocused: value }),
  setPermissionFlowComplete: (value) => set({ permissionFlowComplete: value }),
  globalAlert: null,
  setGlobalAlert: (alert) => set({ globalAlert: alert }),
}));
