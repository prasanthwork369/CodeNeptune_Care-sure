import { ApiAdditionalDataMap } from "@/src/types/productSection";
import { parseProductSections } from "@/src/utils/productSections";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

export const useMoreAboutTabs = (
  additionalData?: ApiAdditionalDataMap | null,
) => {
  const sections = useMemo(
    () => parseProductSections(additionalData),
    [additionalData],
  );

  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const activeTabId = selectedTabId ?? sections[0]?.id ?? null;
  const activeSection =
    sections.find((section) => section.id === activeTabId) ?? sections[0];

  // Ref mirror prevents duplicate state updates and redundant animations/scrolls
  // when scroll events fire repeatedly before React finishes re-rendering.
  const activeTabIdRef = useRef<string | null>(activeTabId);
  activeTabIdRef.current = activeTabId;

  const tabsScrollRef = useRef<ScrollView>(null);
  const pendingScrollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  // Reset tab selection when product data changes
  useEffect(() => {
    setSelectedTabId(null);
    activeTabIdRef.current = null;
    indicatorWidth.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalData]);

  useEffect(
    () => () => {
      if (pendingScrollRef.current) clearTimeout(pendingScrollRef.current);
    },
    [],
  );

  const centreTab = (x: number, width: number, delay: number) => {
    const screenWidth = Dimensions.get("window").width;
    if (pendingScrollRef.current) clearTimeout(pendingScrollRef.current);
    pendingScrollRef.current = setTimeout(() => {
      tabsScrollRef.current?.scrollTo({
        x: Math.max(0, x - (screenWidth - width) / 2),
        animated: true,
      });
    }, delay);
  };

  const activateTab = (
    tabId: string,
    indicatorDuration: number,
    centreDelay: number,
  ) => {
    // Avoid duplicate work if tab is already active and indicator is placed
    if (tabId === activeTabIdRef.current && indicatorWidth.value > 0) return;
    activeTabIdRef.current = tabId;

    const layout = tabLayouts.current[tabId];
    if (layout) {
      if (indicatorDuration === 0) {
        indicatorX.value = layout.x;
        indicatorWidth.value = layout.width;
      } else {
        indicatorX.value = withTiming(layout.x, {
          duration: indicatorDuration,
          easing: Easing.out(Easing.quad),
        });
        indicatorWidth.value = withTiming(layout.width, {
          duration: indicatorDuration,
          easing: Easing.out(Easing.quad),
        });
      }
      centreTab(layout.x, layout.width, centreDelay);
    }

    setSelectedTabId(tabId);
  };

  const handleTabPress = (tabId: string) => activateTab(tabId, 250, 50);
  // During vertical scroll, update underline smoothly and center tab with debounce
  const syncActiveSectionId = (tabId: string) => activateTab(tabId, 60, 100);

  const handleTabLayout = (
    tabId: string,
    x: number,
    width: number,
    isActive: boolean,
  ) => {
    tabLayouts.current[tabId] = { x, width };
    if (isActive && indicatorWidth.value === 0) {
      indicatorX.value = x;
      indicatorWidth.value = width;
      centreTab(x, width, 100);
    }
  };

  return {
    sections,
    activeSection,
    tabsScrollRef,
    indicatorX,
    indicatorWidth,
    handleTabPress,
    handleTabLayout,
    setActiveSectionId: handleTabPress,
    syncActiveSectionId,
  };
};
