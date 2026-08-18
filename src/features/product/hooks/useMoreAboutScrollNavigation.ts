import { ApiAdditionalDataMap } from "@/src/features/product/types";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";
import { useMoreAboutTabs } from "./useMoreAboutTabs";

export const useMoreAboutScrollNavigation = (
  additionalData: ApiAdditionalDataMap | null | undefined,
  parentScrollRef: React.RefObject<ScrollView | null>,
) => {
  const tabs = useMoreAboutTabs(additionalData);
  const [isSticky, setIsSticky] = useState(false);
  // Ref mirror of isSticky so handleScroll's useCallback can read the current
  // value without adding isSticky to its dep array (which would recreate the
  // callback on every sticky transition and break callback stability).
  const isStickyRef = useRef(false);
  const sectionLayouts = useRef<Record<string, { y: number; height: number }>>(
    {},
  );
  const tabsHeight = useRef(0);
  const tabsY = useRef<number | null>(null);
  const isTabPressScrolling = useRef(false);
  const pressedSectionId = useRef<string | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sectionLayouts.current = {};
    tabsY.current = null;
    // Sync both the state and its ref mirror so handleScroll reads the correct
    // baseline after a product change (e.g. navigating between PDPs).
    isStickyRef.current = false;
    setIsSticky(false);
  }, [additionalData]);

  useEffect(
    () => () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    },
    [],
  );

  const handleTabPress = useCallback(
    (sectionId: string) => {
      const sectionLayout = sectionLayouts.current[sectionId];
      if (sectionLayout) {
        pressedSectionId.current = sectionId;
        isTabPressScrolling.current = true;
        if (scrollTimer.current) clearTimeout(scrollTimer.current);
        parentScrollRef.current?.scrollTo({
          y: Math.max(0, sectionLayout.y - tabsHeight.current),
          animated: true,
        });
        scrollTimer.current = setTimeout(() => {
          isTabPressScrolling.current = false;
          pressedSectionId.current = null;
        }, 700);
      }
      tabs.setActiveSectionId(sectionId);
    },
    [parentScrollRef, tabs],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const scrollY = contentOffset.y;
      // Hysteresis dead-zone (±2dp) prevents flicker when the user slow-scrolls
      // exactly at the threshold boundary. Without this, every frame that
      // crosses tabsY triggers a show→hide→show sequence, causing the opacity
      // animation to interrupt itself and produce a visible flicker.
      //
      // - Currently hidden  → show only when scrollY ≥ tabsY + 2
      // - Currently visible → hide only when scrollY ≤ tabsY - 2
      //
      // isStickyRef (ref mirror of isSticky) is used instead of the state
      // value so this closure never goes stale without being in the dep array.
      if (tabsY.current !== null) {
        const showThreshold = tabsY.current + 2;
        const hideThreshold = tabsY.current - 2;
        const nextSticky = isStickyRef.current
          ? scrollY > hideThreshold   // currently shown: hide only if clearly above
          : scrollY >= showThreshold; // currently hidden: show only if clearly past
        if (nextSticky !== isStickyRef.current) {
          isStickyRef.current = nextSticky;
          setIsSticky(nextSticky);
        }
      }
      if (isTabPressScrolling.current || pressedSectionId.current) return;

      const firstLayout = sectionLayouts.current[tabs.sections[0]?.id];
      const lastLayout =
        sectionLayouts.current[tabs.sections[tabs.sections.length - 1]?.id];
      const availableHeight = layoutMeasurement.height - tabsHeight.current;
      const maxScrollY = Math.max(
        0,
        contentSize.height - layoutMeasurement.height,
      );
      const remainingScroll =
        contentSize.height - (scrollY + layoutMeasurement.height);
      const isNearBottom = remainingScroll <= 32;

      // When reaching or near bottom, activate the final section even if maxScrollY
      // prevents its top edge from physically reaching the 20% visible line.
      if (isNearBottom) {
        const lastSectionId =
          tabs.sections[tabs.sections.length - 1]?.id;
        if (lastSectionId) {
          tabs.syncActiveSectionId(lastSectionId);
        }
        return;
      }

      const isCompactContent =
        firstLayout &&
        lastLayout &&
        lastLayout.y + lastLayout.height - firstLayout.y <=
          availableHeight * 1.5;

      // With little vertical overflow, preserve selected tab.
      if (isCompactContent) return;

      // Activation line below sticky tabs.
      const visibleY = scrollY + tabsHeight.current + availableHeight * 0.2;
      let visibleSectionId: string | undefined;
      for (const section of tabs.sections) {
        const layout = sectionLayouts.current[section.id];
        if (!layout) continue;

        if (layout.y <= visibleY) {
          visibleSectionId = section.id;
          continue;
        }

        // Clamped threshold for physically unreachable end sections.
        const requiredScrollY =
          layout.y - tabsHeight.current - availableHeight * 0.2;
        if (requiredScrollY > maxScrollY && scrollY >= maxScrollY - 32) {
          visibleSectionId = section.id;
        }
      }
      if (visibleSectionId && visibleSectionId !== tabs.activeSection?.id) {
        tabs.syncActiveSectionId(visibleSectionId);
      }
    },
    [tabs],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isTabPressScrolling.current = false;
    pressedSectionId.current = null;
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
      scrollTimer.current = null;
    }
  }, []);

  return {
    ...tabs,
    isSticky,
    handleScroll,
    handleScrollBeginDrag,
    handleTabPress,
    handleTabsLayout: (y: number, height: number) => {
      tabsY.current = y;
      tabsHeight.current = height;
    },
    handleSectionLayout: (sectionId: string, y: number, height: number) => {
      sectionLayouts.current[sectionId] = { y, height };
    },
  };
};

export type MoreAboutScrollNavigation = ReturnType<
  typeof useMoreAboutScrollNavigation
>;
