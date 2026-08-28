import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import { useWalletBalance, useWalletLogs } from "@/src/features/wallet/hooks/useWallet";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { useNav } from "@/src/hooks/useNav";
import { requireInternet } from "@/src/utils/offline";
import { Transaction, TxIconType } from "../types";
import { logToTransactions } from "../walletTransactions";
import React, { useEffect, useState } from "react";
import { Image, LayoutChangeEvent, ScrollView, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { styles as cardStyles } from "../wallet.styles";
import { TransactionHistorySheet } from "../components/TransactionHistorySheet";
import { WalletInfoModal } from "../components/WalletInfoModal";
import { ShimmerBlock } from "@/src/components/ui/shimmer";

// Same near-critically-damped spring as the bottom LiquidTabBar's snap
// animation -- fast settle, no visible overshoot/bounce.
const TAB_SNAP_SPRING = { damping: 28, stiffness: 420, mass: 0.5 } as const;

/**
 * Renders a stylized circular status badge containing a context icon for transaction rows.
 */
const TransactionIcon = ({ type }: { type: TxIconType }) => {
  const isCredit = type === "plus" || type === "coin_credit" || type === "cash";
  const src =
    type === "coin_credit"
      ? HOME_IMAGES.coinCredit
      : type === "coin_debit"
        ? HOME_IMAGES.coinDebit
        : isCredit
          ? HOME_IMAGES.accountBalanceCredit
          : HOME_IMAGES.accountBalanceDebit;

  return (
    <View
      style={[
        cardStyles.txIconContainer,
        isCredit ? cardStyles.txIconCreditBg : cardStyles.txIconDebitBg,
      ]}
    >
      <Image source={src} style={cardStyles.txIconImage} resizeMode="contain" />
    </View>
  );
};

/**
 * The balance figure while the screen is showing at all: still loading, or a
 * real amount. The unavailable case never reaches here — the screen replaces
 * itself with a full-screen state before rendering any card, since a wallet
 * with an unknown balance has nothing safe to act on.
 */
const BalanceValue = ({
  pending,
  value,
  shimmerWidth = 120,
}: {
  pending: boolean;
  value: string;
  shimmerWidth?: number;
}) =>
  pending ? (
    <ShimmerBlock
      width={shimmerWidth}
      height={28}
      borderRadius={6}
      style={{ marginVertical: 4 }}
    />
  ) : (
    <Text style={cardStyles.cardValue}>{value}</Text>
  );

/**
 * WalletLayout Component
 * Displays the user's current account balance across Wallet, Credits, and Coins tabs.
 * Manages tab switching, details rendering, and shows the log of recent transaction history.
 */
export const WalletLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isHistorySheetVisible, setIsHistorySheetVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"wallet" | "credits" | "coins">(
    "wallet",
  );

  const { profile } = useProfile();
  const isCorporateUser = profile?.isCorporateUser ?? false;

  // Only tabs actually rendered — index within this list is the pill's
  // real visual slot, so the spring always animates 0..(length-1) with no
  // discontinuity regardless of whether Credits is shown.
  const visibleTabs = isCorporateUser
    ? (["wallet", "credits", "coins"] as const)
    : (["wallet", "coins"] as const);

  // Drives the sliding white pill behind the active tab
  const tabBarWidth = useSharedValue(0);
  const activeTabIndex = useSharedValue(0);

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    tabBarWidth.value = e.nativeEvent.layout.width;
  };

  useEffect(() => {
    const visualIndex = visibleTabs.findIndex((t) => t === activeTab);
    activeTabIndex.value = withSpring(
      Math.max(0, visualIndex),
      TAB_SNAP_SPRING,
    );
  }, [activeTab, isCorporateUser]);

  // Guard against landing on the Credits tab if the profile loads in as
  // non-corporate after the tab was already selected (e.g. stale UI state).
  useEffect(() => {
    if (!isCorporateUser && activeTab === "credits") setActiveTab("wallet");
  }, [isCorporateUser, activeTab]);

  const tabCount = visibleTabs.length;
  const animatedPillStyle = useAnimatedStyle(() => {
    const tabWidth = tabBarWidth.value / tabCount;
    return {
      width: tabWidth,
      transform: [{ translateX: activeTabIndex.value * tabWidth }],
    };
  });

  const router = useNav();
  // Freshness comes from the queries themselves — staleTime + refetchOnMount,
  // plus useWalletBalance's own refetchOnWindowFocus — rather than a forced
  // refetch on every screen focus, which refetched even when data was
  // already fresh and caused a loading-state flash on every re-visit.
  const {
    balance,
    loading: balanceLoading,
    refreshing: balanceRefreshing,
    error: balanceError,
    refetch: refetchBalance,
  } = useWalletBalance();
  const balanceLiveState = useLiveScreenState({
    error: balanceError,
    hasData: balance != null,
    loading: balanceLoading,
  });

  // A null balance with loading=false is still a pre-auth/pending state — but
  // only while nothing has failed. Without that second clause a failed balance
  // fetch left the shimmer running forever, indistinguishable from a slow one
  // and with no way to retry.
  const isBalancePending = balanceLoading || balance == null;
  const {
    logs,
    loading: logsLoading,
    refreshing: logsRefreshing,
    error: logsError,
    refetch: refetchLogs,
  } = useWalletLogs(20, 0);
  // "No transactions yet" is a statement about the account, so a failed fetch
  // must not borrow it.
  const logsErrorState = useQueryErrorState(logsError);

  const transactions: Transaction[] = logs.flatMap(logToTransactions);
  const previewTxs = transactions.slice(0, 5);

  // Wallet is transactional: every card, tab and Add Money below is an offer to
  // act on a balance. With no balance to act on there is nothing safe to show,
  // so the whole screen becomes the failure state rather than a set of cards
  // standing in for numbers nobody has. A cached balance keeps the normal
  // screen — a real ₹0 is data, and only `balance == null` is the absence of it.
  if (balanceLiveState) {
    return (
      <View style={cardStyles.container}>
        <ScreenHeader
          title="My Wallet / CareSure Coins"
          backgroundColor="#FFFFFF"
        />
        {balanceLiveState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetchBalance()}
            retrying={balanceRefreshing}
          />
        ) : (
          <RetryState
            title="Couldn't load your wallet"
            onRetry={() => void refetchBalance()}
            retrying={balanceRefreshing}
          />
        )}
      </View>
    );
  }

  return (
    <View style={cardStyles.container}>
      <ScreenHeader
        title="My Wallet / CareSure Coins"
        backgroundColor="#FFFFFF"
      />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        contentContainerStyle={[
          cardStyles.scrollContent,
          { paddingBottom: adjustedBottom + 40 },
        ]}
      >
        {/* Balance Dashboard Card */}
        <View style={cardStyles.card}>
          {/* 3D Wallet & Shield absolute background artwork */}
          <Image
            source={HOME_IMAGES.rupeeMoneyBag}
            style={cardStyles.walletIllustration}
            resizeMode="contain"
          />

          {/* Segmented Tab selector */}
          <View style={cardStyles.tabBar} onLayout={onTabBarLayout}>
            <Animated.View style={[cardStyles.tabPill, animatedPillStyle]} />

            {/* Wallet Tab Option */}
            <Touchable
              activeOpacity={0.8}
              onPress={() => setActiveTab("wallet")}
              style={cardStyles.tabItem}
            >
              <icons.wallet
                width={18}
                height={18}
                fill={activeTab === "wallet" ? "#111827" : "#222222"}
              />
              <Text
                style={[
                  cardStyles.tabText,
                  activeTab === "wallet" && cardStyles.activeTabText,
                ]}
              >
                Wallet
              </Text>
            </Touchable>

            {/* Credits Tab Option — corporate users only */}
            {isCorporateUser && (
              <Touchable
                activeOpacity={0.8}
                onPress={() => setActiveTab("credits")}
                style={cardStyles.tabItem}
              >
                <icons.manufacturer
                  width={18}
                  height={18}
                  fill={activeTab === "credits" ? "#111827" : "#222222"}
                />
                <Text
                  style={[
                    cardStyles.tabText,
                    activeTab === "credits" && cardStyles.activeTabText,
                  ]}
                >
                  Credits
                </Text>
              </Touchable>
            )}

            {/* CareSure Coins Tab Option */}
            <Touchable
              activeOpacity={0.8}
              onPress={() => setActiveTab("coins")}
              style={cardStyles.tabItem}
            >
              <icons.rupee_circle
                width={18}
                height={18}
                fill={activeTab === "coins" ? "#111827" : "#222222"}
              />
              <Text
                style={[
                  cardStyles.tabText,
                  activeTab === "coins" && cardStyles.activeTabText,
                ]}
              >
                Coins
              </Text>
            </Touchable>
          </View>

          {/* Wallet Active Tab View */}
          {activeTab === "wallet" && (
            <View style={cardStyles.cardContent}>
              <View style={cardStyles.cardInfoSection}>
                <Text style={cardStyles.cardLabel}>WALLET BALANCE</Text>
                <BalanceValue
                  pending={isBalancePending}
                  value={`₹${Number(balance?.walletBalance ?? 0).toLocaleString()}`}
                />
                <Text style={cardStyles.cardSub}>
                  Use wallet balance to pay for your healthcare needs
                </Text>
              </View>
              <Touchable
                // Reachable only with a cached balance on screen (the failure
                // state above hides it otherwise), and topping up is a wallet
                // mutation — so it goes through the standard gate rather than
                // opening a flow that cannot complete.
                onPress={() => {
                  if (!requireInternet()) return;
                  router.push("/profile/wallet/add-money");
                }}
                activeOpacity={0.85}
                style={cardStyles.addMoneyBtn}
              >
                <Image
                  source={HOME_IMAGES.addCircle}
                  style={cardStyles.addMoneyIcon}
                  resizeMode="contain"
                />
                <Text style={cardStyles.addMoneyText}>Add Money</Text>
              </Touchable>
            </View>
          )}

          {/* Credits Active Tab View */}
          {activeTab === "credits" && (
            <View style={cardStyles.cardContent}>
              <View style={cardStyles.cardInfoSection}>
                <Text style={cardStyles.cardLabel}>CORPORATE CREDITS</Text>
                <BalanceValue
                  pending={isBalancePending}
                  value={`₹${Number(balance?.corporateCredits ?? 0).toLocaleString()}`}
                />
                <Text style={cardStyles.cardSub}>
                  Use employer-provided benefits for your healthcare needs
                </Text>
              </View>
            </View>
          )}

          {/* Coins Active Tab View */}
          {activeTab === "coins" && (
            <View style={cardStyles.cardContent}>
              <View style={cardStyles.cardInfoSection}>
                <Text style={cardStyles.cardLabel}>CARESURE COINS</Text>
                <View style={cardStyles.cardValueRow}>
                  <Image
                    source={HOME_IMAGES.rupeeCoin}
                    style={cardStyles.cardCoinIcon}
                    resizeMode="contain"
                  />
                  <BalanceValue
                    pending={isBalancePending}
                    shimmerWidth={80}
                    value={String(balance?.coinsBalance ?? 0)}
                  />
                </View>
                <Text style={cardStyles.cardSub}>
                  Use employer-provided benefits for your healthcare needs
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Transaction History Section Header */}
        <View style={cardStyles.historyHeader}>
          <Text style={cardStyles.historyTitle}>
            Transaction History
          </Text>
          <Touchable onPress={() => router.push("/profile/wallet/history")}>
            <Text style={cardStyles.viewAllText}>
              View All
            </Text>
          </Touchable>
        </View>

        {/* Transaction list container card */}
        <View style={cardStyles.historyCard}>
          {logsLoading ? (
            <View style={{ padding: 12, gap: 12 }}>
              <ShimmerBlock height={48} borderRadius={8} />
              <ShimmerBlock height={48} borderRadius={8} />
              <ShimmerBlock height={48} borderRadius={8} />
            </View>
          ) : logsErrorState && previewTxs.length === 0 ? (
            // Offline never reaches here — the screen-level gate above owns that
            // case — so this is a server-side failure of the logs alone, with
            // the balance above it having loaded fine.
            <RetryState
              title="Couldn't load transactions"
              onRetry={() => void refetchLogs()}
              retrying={logsRefreshing}
            />
          ) : previewTxs.length === 0 ? (
            <Text style={cardStyles.noTransactionsText}>
              No transactions yet
            </Text>
          ) : (
            previewTxs.map((tx: Transaction, idx) => (
              <View key={tx.id}>
                <View style={cardStyles.txRow}>
                  <TransactionIcon type={tx.iconType} />
                  <View style={cardStyles.txDetails}>
                    <Text style={cardStyles.txTitleText}>
                      {tx.title}
                    </Text>
                    <Text style={cardStyles.txDateSubtitle}>
                      {tx.date}
                    </Text>
                  </View>
                  {tx.isCoin ? (
                    <View style={cardStyles.coinTxContainer}>
                      <Image
                        source={HOME_IMAGES.dollarCoins}
                        style={cardStyles.coinTxIcon}
                        resizeMode="contain"
                      />
                      <Text
                        style={[
                          cardStyles.txTitleText,
                          cardStyles.txAmountText,
                          { color: tx.amountColor },
                        ]}
                      >
                        {tx.amount}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        cardStyles.txAmountText,
                        { color: tx.amountColor },
                      ]}
                    >
                      {tx.amount}
                    </Text>
                  )}
                </View>
                {idx < previewTxs.length - 1 && (
                  <View style={cardStyles.txSeparator} />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <WalletInfoModal
        isVisible={isInfoModalVisible}
        onClose={() => setIsInfoModalVisible(false)}
      />
      <TransactionHistorySheet
        visible={isHistorySheetVisible}
        onClose={() => setIsHistorySheetVisible(false)}
        transactions={transactions}
      />
    </View>
  );
};
