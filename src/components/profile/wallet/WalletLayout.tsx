import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS, HOME_IMAGES } from "@/src/constants/images";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useWalletBalance, useWalletLogs } from "@/src/hooks/queries/useWallet";
import { useNav } from "@/src/hooks/useNav";
import { Transaction, TxIconType } from "@/src/types/wallet";
import { logToTransactions } from "@/src/utils/walletTransactions";
import { DotLottie, type Dotlottie } from "@lottiefiles/dotlottie-react-native";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { profileStyles as s } from '../profile.styles';

// Same near-critically-damped spring as the bottom LiquidTabBar's snap
// animation -- fast settle, no visible overshoot/bounce.
const TAB_SNAP_SPRING = { damping: 28, stiffness: 420, mass: 0.5 } as const;
import { styles as cardStyles } from "./WalletLayout.styles";
import { TransactionHistorySheet } from "./TransactionHistorySheet";
import { WalletInfoModal } from "./WalletInfoModal";
import { ShimmerBlock } from "@/src/components/ui/shimmer";

/**
 * Renders a stylized circular status badge containing a context icon for transaction rows.
 */
const TransactionIcon = ({ type }: { type: TxIconType }) => {
  const isCredit = type === "plus" || type === "coin_credit" || type === "cash";
  const src =
    type === 'coin_credit' ? HOME_IMAGES.coinCredit :
      type === 'coin_debit' ? HOME_IMAGES.coinDebit :
        isCredit ? HOME_IMAGES.accountBalanceCredit :
          HOME_IMAGES.accountBalanceDebit;

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
 * WalletLayout Component
 * Displays the user's current account balance across Wallet, Credits, and Coins tabs.
 * Manages tab switching, details rendering, and shows the log of recent transaction history.
 */
export const WalletLayout: React.FC = () => {
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isHistorySheetVisible, setIsHistorySheetVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"wallet" | "credits" | "coins">("wallet");

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
    const visualIndex = visibleTabs.indexOf(activeTab as any);
    activeTabIndex.value = withSpring(Math.max(0, visualIndex), TAB_SNAP_SPRING);
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
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useWalletBalance();

  // A null balance with active loading=false still denotes a loading/pre-auth state.
  const isBalancePending = balanceLoading || balance == null;
  const { logs, loading: logsLoading, refetch: refetchLogs } = useWalletLogs(20, 0);
  const { data: settings } = useCartWalletSettings();
  const coinValue = settings?.wallet?.coinValueInRupees ?? 1;

  // Refetch on every screen focus so balance/transactions don't show stale
  // cached data when the user navigates back to this tab repeatedly.
  useFocusEffect(
    useCallback(() => {
      refetchBalance();
      refetchLogs();
    }, [refetchBalance, refetchLogs]),
  );

  const transactions: Transaction[] = logs.flatMap(logToTransactions);
  const previewTxs = transactions.slice(0, 5);

  return (
    <View style={cardStyles.container}>
      <ScreenHeader
        title="My Wallet / CareSure Coins"
        backgroundColor="#FFFFFF"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={cardStyles.scrollContent}
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
                {isBalancePending ? (
                  <ShimmerBlock width={120} height={28} borderRadius={6} style={{ marginVertical: 4 }} />
                ) : (
                  <Text style={cardStyles.cardValue}>
                    ₹{Number(balance?.walletBalance ?? 0).toLocaleString()}
                  </Text>
                )}
                <Text style={cardStyles.cardSub}>
                  Use wallet balance to pay for your healthcare needs
                </Text>
              </View>
              <Touchable
                onPress={() => router.push("/profile/wallet/add-money" as any)}
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
                {isBalancePending ? (
                  <ShimmerBlock width={120} height={28} borderRadius={6} style={{ marginVertical: 4 }} />
                ) : (
                  <Text style={cardStyles.cardValue}>
                    ₹{Number(balance?.corporateCredits ?? 0).toLocaleString()}
                  </Text>
                )}
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
                  {isBalancePending ? (
                    <ShimmerBlock width={80} height={28} borderRadius={6} style={{ marginVertical: 4 }} />
                  ) : (
                    <Text style={cardStyles.cardValue}>
                      {balance?.coinsBalance ?? 0}
                    </Text>
                  )}
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
          <Text style={s.walletTitle} className="font-inter-extrabold text-brand-text">
            Transaction History
          </Text>
          <Touchable onPress={() => router.push('/profile/wallet/history' as any)}>
            <Text style={s.walletTxTitle} className="font-inter-bold text-[#FF8A00]">
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
          ) : previewTxs.length === 0 ? (
            <Text style={s.walletLabel} className="font-inter text-brand-subtext text-center py-6">
              No transactions yet
            </Text>
          ) : (
            previewTxs.map((tx: Transaction, idx) => (
              <View key={tx.id}>
                <View style={cardStyles.txRow}>
                  <TransactionIcon type={tx.iconType} />
                  <View style={cardStyles.txDetails}>
                    <Text style={s.walletTxTitle} className="font-inter-medium text-brand-text">
                      {tx.title}
                    </Text>
                    <Text style={[s.walletSub, cardStyles.txDateText]} className="font-inter text-brand-subtext mt-0.5">
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
                        style={[s.walletTxTitle, cardStyles.txAmountText, { color: tx.amountColor }]}
                      >
                        {tx.amount}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[cardStyles.txAmountText, { color: tx.amountColor }]}
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
