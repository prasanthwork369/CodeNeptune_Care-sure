import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { SlidingTabs } from "@/src/components/ui/SlidingTabs";
import { useInfiniteWalletLogs } from "@/src/hooks/queries/useWallet";
import { usePagerTabs } from "@/src/hooks/ui/usePagerTabs";
import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import { WalletHistoryPage } from "./sections/WalletHistoryPage";
import {
  filterTransactions,
  logToTransactions,
  WalletTabKey,
} from "./walletHistory.helpers";

const TABS: { key: WalletTabKey; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Debited", label: "Debited" },
  { key: "Credited", label: "Credited" },
];

const TAB_KEYS = TABS.map((t) => t.key);

export const WalletHistoryLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const {
    scrollRef,
    scrollHandler,
    progress,
    pageWidth,
    setPageWidth,
    activeKey,
    goToTab,
  } = usePagerTabs(TAB_KEYS);

  // One query for every page — tabs only filter what is already fetched.
  const { logs, loading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteWalletLogs();

  const all = logs.flatMap(logToTransactions);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
      <ScreenHeader
        title="Transaction History"
        backgroundColor="#FFFFFF"
        showBorder
      />

      <SlidingTabs
        tabs={TABS}
        activeKey={activeKey}
        onTabPress={goToTab}
        progress={progress}
        indicatorInset={exactScale(15)}
        borderColor="#E5E7EB"
        inactiveColor="#222222"
        paddingVertical={exactScale(16)}
        labelStyle={{ fontSize: 15 }}
      />

      <View
        style={{ flex: 1 }}
        onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
      >
        {pageWidth > 0 && (
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {TABS.map((tab) => (
              <WalletHistoryPage
                key={tab.key}
                transactions={filterTransactions(all, tab.key)}
                width={pageWidth}
                loading={loading}
                isFetchingNextPage={isFetchingNextPage}
                paddingBottom={adjustedBottom + 24}
                onEndReached={loadMore}
              />
            ))}
          </Animated.ScrollView>
        )}
      </View>
    </View>
  );
};
