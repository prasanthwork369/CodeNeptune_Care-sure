import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { SlidingTabs } from "@/src/components/ui/SlidingTabs";
import { useInfiniteWalletLogs } from "@/src/features/wallet/hooks/useWallet";
import { usePagerTabs } from "@/src/hooks/ui/usePagerTabs";
import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { exactScale } from "@/src/utils/exactScale";
import { WalletHistoryPage } from "../sections/WalletHistoryPage";
import {
  filterTransactions,
  logToTransactions,
  WalletTabKey,
} from "../walletHistory.helpers";

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
    handleMomentumScrollEnd,
    handleScrollEndDrag,
    progress,
    pageWidth,
    setPageWidth,
    activeKey,
    goToTab,
  } = usePagerTabs(TAB_KEYS);

  // One query for every page — tabs only filter what is already fetched.
  const {
    logs,
    loading,
    refreshing,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteWalletLogs();
  const errorState = useQueryErrorState(error);

  const all = useMemo(() => logs.flatMap(logToTransactions), [logs]);

  const transactionsByTab = useMemo(
    () => ({
      All: filterTransactions(all, "All"),
      Debited: filterTransactions(all, "Debited"),
      Credited: filterTransactions(all, "Credited"),
    }),
    [all],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Full-screen, above the tabs — one query backs all three, so with nothing
  // cached there is no tab worth showing and no page to swipe to. Anything in
  // `all` (including the first page seeded from Wallet home) keeps the normal
  // screen, and a tab that filters down to nothing keeps its own empty state.
  //
  // The hook stays mounted here while the pager below is gone, so the query
  // keeps an observer and onlineManager's reconnect refetch restores the
  // screen on its own.
  if (!loading && errorState && all.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
        <ScreenHeader
          title="Transaction History"
          backgroundColor="#FFFFFF"
          showBorder
        />
        {errorState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetch()}
            retrying={refreshing}
          />
        ) : (
          <RetryState
            title="Couldn't load transactions"
            onRetry={() => void refetch()}
            retrying={refreshing}
          />
        )}
      </View>
    );
  }

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
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScrollEndDrag={handleScrollEndDrag}
            scrollEventThrottle={16}
            decelerationRate="fast"
            directionalLockEnabled
            disableIntervalMomentum
          >
            {TABS.map((tab) => (
              <WalletHistoryPage
                key={tab.key}
                transactions={transactionsByTab[tab.key]}
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
