import { ApiAdditionalDataMap } from "@/src/types/productSection";
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
      pressedSectionId.current = sectionId;
      const sectionLayout = sectionLayouts.current[sectionId];
      if (sectionLayout) {
        isTabPressScrolling.current = true;
        if (scrollTimer.current) clearTimeout(scrollTimer.current);
        parentScrollRef.current?.scrollTo({
          y: Math.max(0, sectionLayout.y - tabsHeight.current),
          animated: true,
        });
        scrollTimer.current = setTimeout(() => {
          isTabPressScrolling.current = false;
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
      setIsSticky(tabsY.current !== null && scrollY >= tabsY.current);
      if (isTabPressScrolling.current || pressedSectionId.current) return;

      const firstLayout = sectionLayouts.current[tabs.sections[0]?.id];
      const lastLayout =
        sectionLayouts.current[tabs.sections[tabs.sections.length - 1]?.id];
      const availableHeight = layoutMeasurement.height - tabsHeight.current;
      const isAtBottom =
        scrollY + layoutMeasurement.height >= contentSize.height - 1;

      if (isAtBottom) {
        const lastSectionId = tabs.sections.at(-1)?.id;
        if (lastSectionId && lastSectionId !== tabs.activeSection?.id) {
          tabs.syncActiveSectionId(lastSectionId);
        }
        return;
      }

      const isCompactContent =
        firstLayout &&
        lastLayout &&
        lastLayout.y + lastLayout.height - firstLayout.y <=
          availableHeight * 1.5;

      // With little vertical overflow, several short sections remain visible
      // together and there is not enough scroll range to give each heading a
      // reliable activation point. Preserve the user's selected tab instead
      // of making the indicator jump between those sections.
      if (isCompactContent) return;

      // Use an activation line below the sticky tabs. At the real bottom,
      // select the final section because it cannot reach that line naturally.
      const visibleY = scrollY + tabsHeight.current + availableHeight * 0.2;
      let visibleSectionId: string | undefined;
      for (const section of tabs.sections) {
        const layout = sectionLayouts.current[section.id];
        if (layout && layout.y <= visibleY) visibleSectionId = section.id;
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
